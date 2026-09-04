import authStore from "@/store/authStore";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const profile = authStore((state) => state.profile);
  const loading = authStore((state) => state.loading);
  const fetchProfile = authStore((state) => state.fetchProfile);

  useEffect(() => {
    if (profile === undefined && !loading) {
      fetchProfile();
    }
  }, [profile, loading, fetchProfile]);

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
  if (profile) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;