export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  CommunityTab: undefined;
  MyPageTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  AuthFlow: undefined;
  MainTabs: undefined;
  NewTripFlow: undefined;
  RouteCompare: { tripId: string };
  TripGuidebook: { tripId: string };
  TripEdit: { tripId: string; routeId: string };
  CommunityPostDetail: { postId: string };
};
