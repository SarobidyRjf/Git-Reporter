/**
 * Controller de gestion des équipes
 * 
 * @module controllers/teams
 */

import { Response } from 'express';
import prisma from '../db';
import { NotFoundError, ValidationError, ForbiddenError } from '../middlewares/error.middleware';
import { AuthenticatedRequest } from '../types';
import { CreateTeamDto, AddMemberDto, UpdateMemberRoleDto, TeamRole } from '../types/teams.types';
import logger, { logDatabase } from '../utils/logger';

/**
 * Récupère la liste des équipes de l'utilisateur
 */
export const getTeams = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) throw new ValidationError('Utilisateur non authentifié');
    const userId = req.user.userId;

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        _count: {
          select: { reports: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: teams,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('❌ Error fetching teams', { error });
    throw error;
  }
};

/**
 * Crée une nouvelle équipe
 */
export const createTeam = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) throw new ValidationError('Utilisateur non authentifié');
    const userId = req.user.userId;
    const { name }: CreateTeamDto = req.body;

    if (!name?.trim()) throw new ValidationError('Le nom de l\'équipe est requis');

    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId,
            role: TeamRole.ADMIN
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        }
      }
    });

    logDatabase('CREATE', 'Team', { teamId: team.id, userId });

    res.status(201).json({
      success: true,
      data: team,
      message: 'Équipe créée avec succès'
    });
  } catch (error) {
    logger.error('❌ Error creating team', { error });
    throw error;
  }
};

/**
 * Récupère les détails d'une équipe
 */
export const getTeam = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) throw new ValidationError('Utilisateur non authentifié');
    const { id } = req.params;
    const userId = req.user.userId;

    const team = await prisma.team.findFirst({
      where: {
        id,
        members: { some: { userId } }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          },
          orderBy: { joinedAt: 'asc' }
        },
        reports: {
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                repoNames: true,
                createdAt: true,
                method: true,
                user: { select: { name: true } }
            }
        }
      }
    });

    if (!team) throw new NotFoundError('Équipe non trouvée');

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    logger.error('❌ Error fetching team', { error });
    throw error;
  }
};

/**
 * Ajoute un membre à l'équipe
 */
export const addMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) throw new ValidationError('Utilisateur non authentifié');
    const { id } = req.params;
    const userId = req.user.userId;
    const { email, role = TeamRole.MEMBER }: AddMemberDto = req.body;

    // Check permissions (Only Admin)
    const requester = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId: id } }
    });

    if (!requester || requester.role !== TeamRole.ADMIN) {
      throw new ForbiddenError('Seul un administrateur peut ajouter des membres');
    }

    // Find user by email
    const userToAdd = await prisma.user.findFirst({
      where: { email }
    });

    if (!userToAdd) {
        // In a real app we'd create an invite. For MVP, error.
      throw new NotFoundError(`Aucun utilisateur trouvé avec l'email ${email}`);
    }

    // Check if already member
    const existingMember = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId: userToAdd.id, teamId: id } }
    });

    if (existingMember) {
      throw new ValidationError('Cet utilisateur est déjà membre de l\'équipe');
    }

    const member = await prisma.teamMember.create({
      data: {
        userId: userToAdd.id,
        teamId: id,
        role: role as any // Cast for prisma enum match if needed
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    res.status(201).json({
      success: true,
      data: member,
      message: 'Membre ajouté avec succès'
    });
  } catch (error) {
    logger.error('❌ Error adding member', { error });
    throw error;
  }
};

/**
 * Met à jour le rôle d'un membre
 */
export const updateMemberRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) throw new ValidationError('Utilisateur non authentifié');
    const { id, memberId } = req.params;
    const userId = req.user.userId;
    const { role }: UpdateMemberRoleDto = req.body;

    // Permissions (Admin only)
    const requester = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId: id } }
    });

    if (!requester || requester.role !== TeamRole.ADMIN) {
      throw new ForbiddenError('Permission refusée');
    }
    
    // Prevent removing last admin
    if (role !== TeamRole.ADMIN) {
        const admins = await prisma.teamMember.count({
            where: { teamId: id, role: TeamRole.ADMIN }
        });
        const targetMember = await prisma.teamMember.findUnique({
            where: { id: memberId }
        });
        if (targetMember?.role === TeamRole.ADMIN && admins <= 1) {
             throw new ValidationError('Impossible de changer le rôle du dernier administrateur');
        }
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role: role as any },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });

    res.json({
      success: true,
      data: updatedMember,
      message: 'Rôle mis à jour'
    });
  } catch (error) {
    logger.error('❌ Error updating member', { error });
    throw error;
  }
};

/**
 * Supprime un membre (ou quitter l'équipe)
 */
export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) throw new ValidationError('Utilisateur non authentifié');
    const { id, memberId } = req.params;
    const userId = req.user.userId;

    const requester = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId: id } }
    });

    if (!requester) throw new ForbiddenError('Non autorisé');

    const targetMember = await prisma.teamMember.findUnique({
      where: { id: memberId }
    });

    if (!targetMember) throw new NotFoundError('Membre non trouvé');

    // Can remove if Admin OR removing self
    // If removing self (Leaving)
    const isSelf = targetMember.userId === userId;

    if (!isSelf && requester.role !== TeamRole.ADMIN) {
      throw new ForbiddenError('Seul un administrateur peut retirer des membres');
    }
    
    // If leaving/removing admin, check if last admin
    if (targetMember.role === TeamRole.ADMIN) {
         const admins = await prisma.teamMember.count({
            where: { teamId: id, role: TeamRole.ADMIN }
        });
        if (admins <= 1) {
            throw new ValidationError('Le dernier administrateur ne peut pas quitter l\'équipe. Supprimez l\'équipe ou nommez un autre admin.');
        }
    }

    await prisma.teamMember.delete({
      where: { id: memberId }
    });

    res.json({
      success: true,
      message: isSelf ? 'Vous avez quitté l\'équipe' : 'Membre retiré'
    });
  } catch (error) {
    logger.error('❌ Error removing member', { error });
    throw error;
  }
};

/**
 * Supprime une équipe
 */
export const deleteTeam = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) throw new ValidationError('Utilisateur non authentifié');
    const { id } = req.params;
    const userId = req.user.userId;

    const requester = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId: id } }
    });

    if (!requester || requester.role !== TeamRole.ADMIN) {
      throw new ForbiddenError('Seul un administrateur peut supprimer l\'équipe');
    }

    await prisma.team.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Équipe supprimée'
    });
  } catch (error) {
    logger.error('❌ Error deleting team', { error });
    throw error;
  }
};
