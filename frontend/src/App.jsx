import { BrowserRouter, Routes, Route } from "react-router-dom";
import VerifyOTP from "./pages/VerifyOTP/VerifyOTP";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Register from "./pages/Auth/Register";
import Exams from "./pages/Exams/Exams";
import Subjects from "./pages/Subjects/Subjects";
import StudyPlan from "./pages/StudyPlan/StudyPlan";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import AIAssistantPage from "./pages/AIAssistant/AIAssistantPage";

function App() {

    return (

        <BrowserRouter>

            <Routes>
                <Route
                    path="/ai-assistant"
                    element={
                        <ProtectedRoute>
                            <AIAssistantPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/study-plan/:examId"
                    element={
                        <ProtectedRoute>
                            <StudyPlan />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />
                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />
                <Route
                    path="/subjects/:examId"
                    element={
                        <ProtectedRoute>
                            <Subjects />
                        </ProtectedRoute>
                    }

                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/exams"
                    element={
                        <ProtectedRoute>
                            <Exams />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/verify-otp"
                    element={<VerifyOTP />}
                />
            </Routes>

        </BrowserRouter>

    );

}

export default App;