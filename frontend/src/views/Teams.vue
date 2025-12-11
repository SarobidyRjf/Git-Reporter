<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Users, Plus, Trash2, MoreVertical, LogOut, Shield, User as UserIcon, X, Mail } from 'lucide-vue-next';
import AppLayout from '../components/AppLayout.vue';
import api from '../services/api';
import type { Team, TeamMember } from '../types';
import { TeamRole } from '../types';
import { useAuthStore } from '../stores/auth.store';

const authStore = useAuthStore();
const teams = ref<Team[]>([]);
const isLoading = ref(true);
const isCreating = ref(false);
const showCreateModal = ref(false);
const newTeamName = ref('');

// Member Management
const selectedTeam = ref<Team | null>(null);
const showMembersModal = ref(false);
const newMemberEmail = ref('');
const newMemberRole = ref<TeamRole>(TeamRole.MEMBER);
const isAddingMember = ref(false);

const currentUser = authStore.user;

onMounted(() => {
  loadTeams();
});

async function loadTeams() {
  isLoading.value = true;
  try {
    const response = await api.getTeams();
    if (response.success && response.data) {
      teams.value = response.data;
    }
  } catch (error) {
    console.error('Failed to load teams:', error);
  } finally {
    isLoading.value = false;
  }
}

async function createTeam() {
  if (!newTeamName.value.trim()) return;
  
  isCreating.value = true;
  try {
    const response = await api.createTeam({ name: newTeamName.value });
    if (response.success) {
      await loadTeams();
      showCreateModal.value = false;
      newTeamName.value = '';
    }
  } catch (error) {
    console.error('Failed to create team:', error);
  } finally {
    isCreating.value = false;
  }
}

async function deleteTeam(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;
    try {
        await api.deleteTeam(id);
        await loadTeams();
    } catch (error) {
        console.error('Failed to delete team', error);
    }
}

function openMembersModal(team: Team) {
    selectedTeam.value = team;
    showMembersModal.value = true;
    newMemberEmail.value = '';
    newMemberRole.value = TeamRole.MEMBER;
}

async function addMember() {
    if (!selectedTeam.value || !newMemberEmail.value) return;
    isAddingMember.value = true;
    try {
        await api.addTeamMember(selectedTeam.value.id, {
            email: newMemberEmail.value,
            role: newMemberRole.value
        });
        // Refresh team members. We can either reload all teams or fetch just this team.
        // For simplicity, reload all for now to keep local state synced easily.
        await loadTeams(); 
        
        // Update local selected team reference from the fresh list
        const updatedTeam = teams.value.find(t => t.id === selectedTeam.value?.id);
        if (updatedTeam) selectedTeam.value = updatedTeam;
        
        newMemberEmail.value = '';
    } catch (error) {
        console.error('Failed to add member', error);
        alert('Impossible d\'ajouter le membre. Vérifiez l\'email.');
    } finally {
        isAddingMember.value = false;
    }
}

async function removeMember(memberId: string) {
    if (!selectedTeam.value) return;
    if (!confirm('Retirer ce membre ?')) return;
    try {
        await api.removeTeamMember(selectedTeam.value.id, memberId);
        await loadTeams();
         const updatedTeam = teams.value.find(t => t.id === selectedTeam.value?.id);
        if (updatedTeam) selectedTeam.value = updatedTeam;
    } catch (error) {
        console.error('Failed to remove member', error);
    }
}

function canManageTeam(team: Team): boolean {
    const membership = team.members.find(m => m.userId === currentUser?.id);
    return membership?.role === TeamRole.ADMIN;
}
</script>

<template>
  <AppLayout>
    <div class="space-y-6 p-6 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold phone:text-xl" style="color: var(--text-primary)">Équipes</h1>
          <p class="text-zinc-400 mt-1 phone:text-sm">Gérez vos équipes et collaborez sur vos rapports.</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 font-medium shadow-lg shadow-purple-900/20"
        >
          <Plus :size="18" />
          <span class="hidden sm:inline">Nouvelle équipe</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="teams.length === 0" class="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div class="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users :size="32" class="text-zinc-500" />
        </div>
        <h3 class="text-lg font-medium text-white mb-2">Aucune équipe</h3>
        <p class="text-zinc-400 max-w-sm mx-auto mb-6">Créez une équipe pour commencer à partager vos rapports.</p>
        <button
          @click="showCreateModal = true"
          class="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
        >
          Créer une équipe
        </button>
      </div>

      <!-- Teams Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="team in teams"
          :key="team.id"
          class="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all group flex flex-col"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Users :size="24" class="text-purple-400" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                  {{ team.name }}
                </h3>
                <p class="text-xs text-zinc-500 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {{ team.members.length }} membre{{ team.members.length > 1 ? 's' : '' }}
                </p>
              </div>
            </div>
             <div class="flex gap-2" v-if="canManageTeam(team)">
                <button @click="deleteTeam(team.id)" class="text-zinc-500 hover:text-red-400 transition-colors p-1" title="Supprimer l'équipe">
                    <Trash2 :size="16" />
                </button>
             </div>
          </div>
          
          <div class="flex-1">
             <!-- Preview Members (Avatars) -->
             <div class="flex -space-x-2 overflow-hidden mb-4 pl-1 pt-2">
                <div v-for="member in team.members.slice(0, 5)" :key="member.id" class="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-zinc-800 flex items-center justify-center text-xs font-medium text-white relative group/avatar" :title="member.user.name || member.user.email || 'User'">
                    <img v-if="member.user.avatarUrl" :src="member.user.avatarUrl" :alt="member.user.name || ''" class="h-full w-full rounded-full object-cover" />
                    <span v-else>{{ (member.user.name || 'U').charAt(0).toUpperCase() }}</span>
                    <!-- Role Badge if Admin -->
                    <div v-if="member.role === 'ADMIN'" class="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] p-0.5 rounded-full z-10">
                        <Shield :size="6" stroke-width="4" />
                    </div>
                </div>
                <div v-if="team.members.length > 5" class="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
                    +{{ team.members.length - 5 }}
                </div>
             </div>
          </div>

          <div class="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
             <div class="text-xs text-zinc-500">
                {{ team._count?.reports || 0 }} rapports
             </div>
             <button @click="openMembersModal(team)" class="text-sm text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Gérer les membres &rarr;
             </button>
          </div>
        </div>
      </div>

      <!-- Create Team Modal -->
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
          <button @click="showCreateModal = false" class="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
             <X :size="20" />
          </button>
          
          <h3 class="text-xl font-bold text-white mb-1">Nouvelle équipe</h3>
          <p class="text-sm text-zinc-400 mb-6">Créez un espace collaboratif pour vos rapports.</p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-zinc-300 mb-1.5">Nom de l'équipe</label>
              <input
                v-model="newTeamName"
                type="text"
                class="w-full px-4 py-2.5 bg-black/40 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder="Ex: Développeurs Frontend"
                @keyup.enter="createTeam"
                autofocus
              />
            </div>
            
            <div class="flex justify-end gap-3 mt-8">
              <button
                @click="showCreateModal = false"
                class="px-4 py-2 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors font-medium text-sm"
              >
                Annuler
              </button>
              <button
                @click="createTeam"
                :disabled="!newTeamName.trim() || isCreating"
                class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium text-sm shadow-lg shadow-purple-900/30"
              >
                <div v-if="isCreating" class="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                <span>Créer l'équipe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Manage Members Modal -->
      <div v-if="showMembersModal && selectedTeam" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl p-0 shadow-2xl relative flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <!-- Modal Header -->
            <div class="p-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 bg-zinc-900 rounded-t-xl z-10">
                <div>
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        <Users :size="20" class="text-purple-400" />
                        {{ selectedTeam.name }}
                    </h3>
                    <p class="text-sm text-zinc-400 mt-1">Gérer les membres et leurs rôles</p>
                </div>
                <button @click="showMembersModal = false" class="bg-zinc-800 hover:bg-zinc-700 p-2 rounded-lg text-zinc-400 hover:text-white transition-colors">
                    <X :size="20" />
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6">
                <!-- Add Member Form -->
                <div v-if="canManageTeam(selectedTeam)" class="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50 mb-8">
                    <h4 class="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                        <Plus :size="16" /> Ajouter un membre
                    </h4>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input 
                            v-model="newMemberEmail"
                            type="email" 
                            placeholder="Email du membre (ex: dev@company.com)"
                            class="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        />
                        <select 
                            v-model="newMemberRole"
                            class="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                            <option value="MEMBER">Membre</option>
                            <option value="ADMIN">Admin</option>
                            <option value="VIEWER">Observateur</option>
                        </select>
                        <button 
                            @click="addMember" 
                            :disabled="!newMemberEmail || isAddingMember"
                            class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {{ isAddingMember ? 'Ajout...' : 'Inviter' }}
                        </button>
                    </div>
                </div>

                <!-- Members List -->
                <h4 class="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Membres ({{ selectedTeam.members.length }})</h4>
                <div class="space-y-3">
                    <div v-for="member in selectedTeam.members" :key="member.id" class="flex items-center justify-between bg-zinc-800/20 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                        <div class="flex items-center gap-3">
                            <img v-if="member.user.avatarUrl" :src="member.user.avatarUrl" class="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-700" />
                            <div v-else class="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center ring-2 ring-zinc-700">
                                <UserIcon :size="20" class="text-zinc-500" />
                            </div>
                            <div>
                                <div class="text-sm font-medium text-white flex items-center gap-2">
                                    {{ member.user.name || 'Utilisateur inconnu' }}
                                    <span v-if="member.user.id === currentUser?.id" class="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Vous</span>
                                </div>
                                <div class="text-xs text-zinc-500">{{ member.user.email }}</div>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-4">
                            <!-- Role Badge -->
                            <div class="px-2 py-1 rounded text-xs font-medium border"
                                :class="{
                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20': member.role === 'ADMIN',
                                    'bg-blue-500/10 text-blue-500 border-blue-500/20': member.role === 'MEMBER',
                                    'bg-zinc-500/10 text-zinc-400 border-zinc-500/20': member.role === 'VIEWER'
                                }">
                                {{ member.role }}
                            </div>

                            <!-- Actions -->
                            <button 
                                v-if="canManageTeam(selectedTeam) && member.user.id !== currentUser?.id" 
                                @click="removeMember(member.id)"
                                class="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded transition-colors"
                                title="Retirer de l'équipe"
                            >
                                <LogOut :size="16" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="p-6 border-t border-zinc-800 bg-zinc-900/50 rounded-b-xl flex justify-end">
                <button @click="showMembersModal = false" class="text-zinc-400 hover:text-white text-sm font-medium transition-colors">Fermer</button>
            </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
