import authStore from "@/store/authStore";
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
    const profile = authStore((state) => state.profile);
    const loading = authStore((state) => state.loading);
    const fetchProfile = authStore((state) => state.fetchProfile);
    const location = useLocation();

    useEffect(() => {
        if (!profile) {
            (async () => {
                await fetchProfile();
            })();
        }
    }, [profile, fetchProfile]);
    if (profile === undefined && loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 
                      border-b-2 
                      border-gray-900 dark:border-gray-100">
                </div>
            </div>
        );
    }

    if (profile === null) {
        return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;