import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db 
} from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up function with role selection (welder or recruiter)
  const signup = async (email, password, role, fullName) => {
    try {
      // Create user with email and password
      console.log(auth,email,password);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Create user profile in Firestore
      const userProfileData = {
        uid: userCredential.user.uid,
        email,
        fullName,
        role, // 'welder' or 'recruiter'
        createdAt: new Date().toISOString(),
        connections: [],
        emailVerified: false
      };
      
      await setDoc(doc(db, "users", userCredential.user.uid), userProfileData);
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    return signOut(auth);
  };

  // Fetch user profile data
  const fetchUserProfile = async (uid) => {
    if (!uid) return null;
    
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserProfile(userData);
      return userData;
    }
    return null;
  };

  // Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    fetchUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};