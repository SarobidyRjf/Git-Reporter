import { Router } from 'express';
import {
  getTeams,
  createTeam,
  getTeam,
  addMember,
  updateMemberRole,
  removeMember,
  deleteTeam
} from '../controllers/teams.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes principales
router.get('/', getTeams);
router.post('/', createTeam);
router.get('/:id', getTeam);
router.delete('/:id', deleteTeam);

// Routes de gestion des membres
router.post('/:id/members', addMember);
router.put('/:id/members/:memberId', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember); // Pour kick un membre
router.delete('/:id/leave', async (req, res, next) => {
    // Alias pour quitter l'équipe (meme logique que removeMember mais sans memberId requis dans URL si on utilisait current user, 
    // mais ici on réutilise removeMember en passant l'ID du membre self cote frontend)
    // En fait, removeMember prend :memberId.
    // Le frontend devra chercher son propre memberID pour appeler DELETE /:id/members/:myMemberId
    res.status(404).json({ message: "Use DELETE /:id/members/:memberId" });
});

export default router;
