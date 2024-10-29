"use client";

import React, { useState, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';
import CreateEvent from '@/components/CreateEvent';
import * as d3 from 'd3';

interface Bubble {
  title: string;
  time: string;
  location: string;
  numOfPeople: number;
  description: string;
  admin: string;
  isOpen: boolean;
}

export default function Dashboard() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBubble, setSelectedBubble] = useState<Bubble | null>(null); // State for selected bubble
  const [compitable,setCompitable] = useState(null);
  const getEmbeddings = async (text: string) => {
    const apiUrl = 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2'; // Example model
    const apiKey = ''; // Store your API key in .env.local
  
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: text }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      return data; // This will contain the embeddings
    } catch (error) {
      console.error('Error fetching embeddings:', error);
      throw error; // Rethrow the error for handling in the calling code
    }
  };

  const getBubblesEmbeddings = async (bubbles: Bubble[]) => {
    const embeddingsArray = [];
  
    for (const bubble of bubbles) {
      if (bubble.description) {
        try {
          const embedding = await getEmbeddings(bubble.description);
          embeddingsArray.push({
            ...bubble, // Keep the original bubble properties
            embedding, // Add the embedding to the bubble object
          });
        } catch (error) {
          console.error('Error fetching embedding for description:', bubble.description, error);
          // Handle the error as needed (e.g., push null embedding or skip)
        }
      } else {
        console.warn('Bubble description is empty or missing:', bubble);
      }
    }
  
    return embeddingsArray;
  };

  const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, value, index) => sum + value * vecB[index], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, value) => sum + value ** 2, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, value) => sum + value ** 2, 0));
  
    return dotProduct / (magnitudeA * magnitudeB);
  };
  
  const getUserSimilarity = async (bubbles, user) => {
    try {
      // Get the user's embedding
      const userEmbedding = await getEmbeddings(user.description || user.text || ''); 
  
      // Get embeddings for all bubbles
      const bubbleEmbeddings = await getBubblesEmbeddings(bubbles);
  
      // Create an array to store similarity scores
      const similarityScores = [];
  
      // Calculate cosine similarity for each bubble's embedding
      for (const bubble of bubbleEmbeddings) {
        if (bubble.embedding) {
          const similarity = cosineSimilarity(userEmbedding, bubble.embedding);
          similarityScores.push({
            id: bubble.id, // Include bubble ID or any other identifier
            similarity, // Cosine similarity score
          });
        } else {
          console.warn('Bubble does not have an embedding:', bubble);
        }
      }
  
      return similarityScores;
    } catch (error) {
      console.error('Error calculating user similarity:', error);
      throw error; // Rethrow the error for handling in the calling code
    }
  };
  

  const createD3Visualization = () => {
    // Remove any existing svg to avoid duplicate visualizations
    const svgContainer = d3.select('#circle-pack');
    
    // Remove the previous SVG content by clearing only child elements within 'circle-pack'
    svgContainer.selectAll('svg').remove();

    // Get Score array from Embedding
    const scores = [
      { eventName: "CS", score: 8 },
      { eventName: "Math", score: 6 },
      { eventName: "Business", score: 3 },
      { eventName: "Economics", score: 1 },
      { eventName: "Soda Hackathon", score: 9 },
      { eventName: "Code Devils", score: 7 },
      { eventName: "React Session", score: 6 },
      { eventName: "Resume Review", score: 9 },
    ];
    
    // Define minimum and maximum radius for circles based on scores
    const minRadius = 45; // Minimum radius for score 1
    const maxRadius = 100; // Maximum radius for score 10
  
    // Prepare data for circles by matching each bubble to its score
    const circles = bubbles.map((bubble) => {
      // Find the score for the current bubble based on its title
      const scoreEntry = scores.find((s) => s.eventName === bubble.title);
      const score = scoreEntry ? scoreEntry.score : 1; // Default to 1 if no score found
  
      // Calculate the radius based on normalized score within min and max range
      const radius = minRadius + ((score - 1) / 9) * (maxRadius - minRadius);
  
      return {
        ...bubble, // Keep all the bubble properties for easy access
        r: radius,
      };
    });
  
    // Sort and pack circles
    circles.sort((a, b) => b.r - a.r);
    const packedCircles = d3.packSiblings(circles);
    
    const svgWidth = 500;
    const svgHeight = 500;

    const svg = svgContainer
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight);
    
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;
  

    // Append circles with labels inside
    const nodes = svg.selectAll('g.node-group')
      .data(packedCircles)
      .enter()
      .append('g') 
      .classed('node-group', true)
      .attr('transform', (d) => `translate(${d.x + centerX}, ${d.y + centerY})`) // Center the nodes
      .on('click', (event, d) => setSelectedBubble(d)); // Set selected bubble on click

      nodes.exit().remove();
      const nodeEnter = nodes.enter()
      .append('g')
      .classed('node-group', true)
      .attr('transform', (d) => `translate(${d.x + centerX}, ${d.y + centerY})`)
      .on('click', (event, d) => setSelectedBubble(d)); // Set selected bubble on click
  
    nodes.append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', 'red')
      .attr('opacity', 0.6);
  
    // Adjust font size based on the circle radius to ensure text stays within
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', (d) => `${Math.max(10, d.r / 4)}px`) // Scale font size based on radius
      .attr('fill', 'white')
      .style('pointer-events', 'none') // Ensure text does not interfere with mouse events
      .attr('dy', '-0.5em') // Adjust vertical positioning slightly upwards
      .text((d) => d.title);
  
    // Append the number of people inside the circle below the title
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', (d) => `${Math.max(8, d.r / 5)}px`) // Adjust font size for people count
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .attr('dy', '0.8em') // Adjust vertical positioning slightly downwards
      .text((d) => `${d.numOfPeople} people`);
  };

  useEffect(() => {
    fetchBubbles();
  }, []);

  useEffect(() => {
    if (!isLoading && bubbles.length > 0) {
      createD3Visualization();
    }
  }, [isLoading, bubbles, createD3Visualization]);

  const fetchBubbles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3002/getBubbles');
      if (!response.ok) {
        throw new Error('Failed to fetch bubbles');
      }
      const data = await response.json();
      setBubbles(data);
    } catch {
      setError('Error fetching bubbles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCompitable(getUserSimilarity(bubbles,JSON.parse(localStorage.getItem('user')).interest));
    console.log(compitable);
  },[bubbles]);

  const handleCreateBubble = async (newBubble: Omit<Bubble, 'numOfPeople' | 'admin' | 'isOpen'>) => {
    try {
      const response = await fetch('http://localhost:3002/addBubble', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newBubble,
          numOfPeople: 1,
          admin: 'currentUser', // Replace with actual logged-in user
          isOpen: true,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create bubble');
      }
      const createdBubble = await response.json();
      setBubbles(prevBubbles => [...prevBubbles, createdBubble]);
    } catch {
      setError('Error creating bubble. Please try again.');
    }
  };

  const handleJoinEvent = async (title: string) => {
    try {
      const response = await fetch('http://localhost:3002/joinEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error('Failed to join event');
      }
      const updatedBubble = await response.json();
      setBubbles(prevBubbles =>
        prevBubbles.map(bubble =>
          bubble.title === title ? updatedBubble : bubble
        )
      );
    } catch {
      setError('Error joining the event.');
    }
  };

  const updateBubbleStatus = async (title: string, isOpen: boolean) => {
    try {
      const response = await fetch('http://localhost:3002/editBubble', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, updates: { isOpen } }),
      });
      if (!response.ok) {
        throw new Error('Failed to update bubble status');
      }
      const updatedBubble = await response.json();
      setBubbles(prevBubbles =>
        prevBubbles.map(bubble =>
          bubble.title === title ? updatedBubble : bubble
        )
      );
    } catch {
      setError('Error updating bubble status.');
    }
  };

  const handleDeleteBubble = async (title: string) => {
    try {
      const response = await fetch('http://localhost:3002/deleteBubble', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete bubble');
      }

      setBubbles(prevBubbles => {
        const updatedBubbles = prevBubbles.filter(bubble => bubble.title !== title);
        setSelectedBubble(null); // Close the info card
        return updatedBubbles;
      });

      createD3Visualization();
    } catch {
      setError('Error deleting bubble.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16 flex">
      <div className="flex-1 flex flex-col items-center justify-center"> {/* Main flex container */}
        <div className="flex justify-between items-center w-full mb-6">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="w-24 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center" // Right-aligned button
          >
            Create Event
          </Button>
        </div>
        {isLoading ? (
          <div className="text-center mt-8">Loading bubbles...</div>
        ) : error ? (
          <div className="text-center mt-8 text-red-500">{error}</div>
        ) : (
          <div
            id="circle-pack"
            className="mt-8 flex items-center justify-center h-[500px] w-full" // Flex container to center SVG
          >
            <svg width="500" height="500" className="mx-auto"></svg>
          </div>
        )}
        <CreateEvent
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreateEvent={handleCreateBubble}
        />
      </div>

      {/* Info Card */}
      {selectedBubble && (
        <div className="ml-8 p-4 w-64 bg-white shadow-lg rounded-lg">
          <h2 className="text-xl font-semibold mb-2">{selectedBubble.title}</h2>
          <p><strong>Time:</strong> {selectedBubble.time}</p>
          <p><strong>Location:</strong> {selectedBubble.location}</p>
          <p><strong>Description:</strong> {selectedBubble.description}</p>
          <p><strong>Admin:</strong> {selectedBubble.admin}</p>
          <p><strong>Number of People:</strong> {selectedBubble.numOfPeople}</p>
          <p><strong>Status:</strong> {selectedBubble.isOpen ? 'Open' : 'Closed'}</p>
          <label className="flex items-center mt-2">
            <input
              type="checkbox"
              checked={selectedBubble.isOpen}
              onChange={(e) => {
                const newStatus = e.target.checked;
                setSelectedBubble({ ...selectedBubble, isOpen: newStatus });
                updateBubbleStatus(selectedBubble.title, newStatus);
              }}
            />
            <span className="ml-2">Event Open</span>
          </label>
          {/* Delete button */}
          <button
            className="mt-4 bg-red-600 hover:bg-red-700 text-white w-full"
            onClick={() => handleDeleteBubble(selectedBubble.title)}
          >
            Delete Event
          </button>
          {/* Join Event Button */}
          <button
              className="mt-4 bg-green-600 hover:bg-green-700 text-white w-full"
              onClick={() => handleJoinEvent(selectedBubble.title)}
            >
              Join Event
            </button>
        </div>
      )}
    </div>
  );
}
