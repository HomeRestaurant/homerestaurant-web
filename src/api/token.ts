const KEY = 'homerestaurant.token'

// localStorage can throw (private mode, blocked storage): treat that as "not logged in"
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(KEY, token)
    } catch {
      // ignore: the session will just not survive a reload
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // ignore
    }
  },
}
