export interface RequestUser {
  userId: number | null;
  isGuest: boolean;
  guestId?: string | null;
}