"use client";

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import React, { useState, useEffect } from 'react';

interface UserSettings {
  username: string;
  password: string;
  university: string;
  year: string;
  major: string;
  minor: string;
  interest: string[];
  skills: string[];
}

const initialSettings: UserSettings = {
  username: '',
  password: '',
  university: '',
  year: '',
  major: '',
  minor: '',
  interest: [],
  skills: [],
};

const yearOptions = [
  { value: 'freshman', label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
];

export default function Settings() {
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log(storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setSettings({
        ...parsedUser,
      })};
    if (storedUser) {
      setSettings(JSON.parse(storedUser));
    }
    setIsLoading(false);
    },[]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (name: keyof UserSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim()),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');

    // Log the settings before submitting to see if the username is present
    console.log('Submitting user settings:', settings);

    if (!settings.username) {
      setMessage('Error updating settings: Username is required.');
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/updateUser', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(settings));
        setMessage('Settings updated successfully');
      } else {
        const errorData = await response.json();
        setMessage(`Error updating settings: ${errorData.error}`);
      }

    } catch {
      setMessage('Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center mt-8 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">User Settings</h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            {/* University Input */}
            <Input
              id="university"
              type="text"
              label="University"
              placeholder=""
              onChange={handleInputChange}
            />

            {/* Year Input */}
            <div className="mb-4">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <select
                id="year"
                name="year"
                value={settings.year}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-base"
              >
                <option value="" disabled>Select your year</option>
                {yearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Major Input */}
            <Input
              id="major"
              type="text"
              label="Major"
              placeholder=""
              onChange={handleInputChange}
            />

            {/* Minor Input */}
            <Input
              id="minor"
              type="text"
              label="Minor (optional)"
              placeholder=""
              onChange={handleInputChange}
            />

            {/* Interest Input */}
            <Input
              id="interest"
              type="text"
              label="Interest"
              placeholder="Enter interests separated by commas"
              onChange={(e) => handleArrayInputChange('interest', e.target.value)}
            />

            {/* Skills Input */}
            <Input
              id="skills"
              type="text"
              label="Skills"
              placeholder="Enter skills separated by commas"
              onChange={(e) => handleArrayInputChange('skills', e.target.value)}
            />
            
            <Button type="submit" className="mt-4">
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </form>
          {message && (
            <p className={`mt-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}