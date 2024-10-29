import React, { useState } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

interface BubbleData {
  title: string;
  time: string;
  location: string;
  description: string;
}

interface CreateEventProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: BubbleData) => void;
}

const CreateEvent = ({ isOpen, onClose, onCreateEvent }: CreateEventProps) => {
  const [bubbleData, setBubbleData] = useState({
    title: '',
    time: '',
    location: '',
    description: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBubbleData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEvent(bubbleData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create New Bubble</h2>
        <form onSubmit={handleSubmit}>
          <Input
            label="Title"
            id="title"
            type="text"
            placeholder="Event title"
            onChange={handleInputChange}
            required
          />
          <Input
            label="Time"
            id="time"
            type="datetime-local"
            placeholder="Event time"
            onChange={handleInputChange}
            required
          />
          <Input
            label="Location"
            id="location"
            type="text"
            placeholder="Event location"
            onChange={handleInputChange}
            required
          />
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Event description"
              value={bubbleData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-md">
              Cancel
            </Button>
            <Button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
              Create Bubble
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;