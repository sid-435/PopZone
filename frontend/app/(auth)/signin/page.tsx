"use client"

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signin () {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter(); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      // Make the API request using fetch
      const response = await fetch(`http://localhost:3002/loginUser?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`, {
        method: 'GET',
      });

      // Check if the response was successful
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const user = await response.json();
      localStorage.setItem('user', JSON.stringify(user.user));
      
      const checkUserStorage = setInterval(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          clearInterval(checkUserStorage); // Stop checking once the user is found
          router.push('/'); 
        }
      }, 100);
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              id="username"
              type="text"
              required
              label="Username"
              placeholder="JohnDoe45"
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              id="password"
              type="password"
              required
              label="Password"
              placeholder='*****'
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account? <a href="/signup" className="font-medium text-blue-700 hover:text-blue-600">Sign up</a>
        </p>
      </div>
    </div>
  );
};