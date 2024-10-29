"use client"

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import React, { useState } from 'react';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple password validation
    if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

    try {
      // Make the API request using fetch
      const response = await fetch('http://localhost:3002/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password,
          university: '', 
          year: '',
          major: [],
          minor: [],
          interest: [],
          skills: [],
          personalityVector: null,
          interestVector: null,
        }),
      });

      // Check if the response was successful
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        throw new Error('Failed to create account');
      }

      const user = await response.json();
      console.log('Signed up:', user);
      window.location.href = '/signin';

    } catch {
      setError('Error creating account. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input id="username" type="text" required label="Username" placeholder="JohnDoe45" onChange={(e) => setUsername(e.target.value)} />
            <Input id="password" type="password" required label="Password" placeholder="*****" onChange={(e) => setPassword(e.target.value)} showPasswordToggle={true} />
            <Input id="confirmPassword" type="password" required label="Confirm Password" placeholder="*****" onChange={(e) => setConfirmPassword(e.target.value)} showPasswordToggle={true}/>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <Button type="submit" className="w-full">
              Sign up
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <a href="/signin" className="font-medium text-blue-700 hover:text-blue-600">Sign in</a>
        </p>
      </div>
    </div>
  );
};