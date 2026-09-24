import { BrowserRouter, Route, Routes } from 'react-router'
import { Header } from './components/Header'
import { AuthProvider } from './features/auth/AuthProvider'
import { RequireAuth } from './features/auth/RequireAuth'
import { RequirePreferences } from './features/auth/RequirePreferences'
import { EditMealPage } from './pages/EditMealPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MealDetailPage } from './pages/MealDetailPage'
import { MyMealsPage } from './pages/MyMealsPage'
import { NewMealPage } from './pages/NewMealPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/accedi" element={<LoginPage />} />
          <Route path="/registrati" element={<RegisterPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/benvenuto" element={<OnboardingPage />} />
          </Route>
          <Route element={<RequirePreferences />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/pasti/:mealId" element={<MealDetailPage />} />
            <Route element={<RequireAuth />}>
              <Route path="/profilo" element={<ProfilePage />} />
              <Route path="/pasti/nuovo" element={<NewMealPage />} />
              <Route path="/pasti/:mealId/modifica" element={<EditMealPage />} />
              <Route path="/i-miei-pasti" element={<MyMealsPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
