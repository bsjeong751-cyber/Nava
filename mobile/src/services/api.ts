import { apiClient } from './apiClient';
import { CommunityPost, Place, Trip, TripDraft } from '../types';

export const authApi = {
  signup: (email: string, password: string, nickname: string) =>
    apiClient.post<{ accessToken: string }>('/auth/signup', { email, password, nickname }).then((r) => r.data),
  login: (email: string, password: string) =>
    apiClient.post<{ accessToken: string }>('/auth/login', { email, password }).then((r) => r.data),
};

export const usersApi = {
  me: () => apiClient.get('/users/me').then((r) => r.data),
};

export const tripsApi = {
  create: (draft: TripDraft) => apiClient.post<Trip>('/trips', draft).then((r) => r.data),
  list: () => apiClient.get<Trip[]>('/trips').then((r) => r.data),
  getOne: (id: string) => apiClient.get<Trip>(`/trips/${id}`).then((r) => r.data),
  generateRoutes: (id: string) => apiClient.post<Trip>(`/trips/${id}/routes/generate`).then((r) => r.data),
  selectRoute: (id: string, routeId: string) =>
    apiClient.post<Trip>(`/trips/${id}/select-route`, { routeId }).then((r) => r.data),
  updateRoutePlaces: (
    id: string,
    routeId: string,
    places: { placeId?: string; dayNumber: number; slotType?: 'PLACE' | 'REST' | 'MEAL'; stayMinutes?: number }[],
  ) => apiClient.patch<Trip>(`/trips/${id}/routes/${routeId}/places`, { places }).then((r) => r.data),
};

export const placesApi = {
  search: (destination: string, q?: string) =>
    apiClient.get<Place[]>('/places/search', { params: { destination, q } }).then((r) => r.data),
};

export const communityApi = {
  list: () => apiClient.get<CommunityPost[]>('/community/posts').then((r) => r.data),
  getOne: (id: string) => apiClient.get(`/community/posts/${id}`).then((r) => r.data),
  create: (tripId: string, title: string, description?: string) =>
    apiClient.post<CommunityPost>('/community/posts', { tripId, title, description }).then((r) => r.data),
  import: (id: string) => apiClient.post<Trip>(`/community/posts/${id}/import`).then((r) => r.data),
  report: (id: string, reason: string, detail?: string) =>
    apiClient.post(`/community/posts/${id}/report`, { reason, detail }).then((r) => r.data),
};
