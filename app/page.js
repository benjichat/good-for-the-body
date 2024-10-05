'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { initialFoods } from './components/foods'; // Adjust the path if necessary

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null); // To track the selected food
  const [isDragging, setIsDragging] = useState(false); // To handle dragging
  const [result, setResult] = useState(''); // For displaying feedback
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Track mouse position

  const robotRef = useRef(null); // Reference to the robot for bounding box calculation

  // On component mount, select 3 unique random foods to display
  useEffect(() => {
    const shuffledFoods = [...initialFoods].sort(() => 0.5 - Math.random());
    const selectedFoods = shuffledFoods.slice(0, 3);
    setFoods(selectedFoods);
  }, []);

  // Update mouse position when the user moves the mouse
  const handleMouseMove = useCallback((e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle global click events to check for dropping
  const handleGlobalClick = useCallback(() => {
    if (selectedFood && isDragging) {
      console.log('Second click detected: dropping food');

      setIsDragging(false); // Disable dragging on second click

      // Get robot's bounding box to detect if food is dropped on the robot
      const robotRect = robotRef.current.getBoundingClientRect();
      console.log('Robot bounding box:', robotRect);
      console.log('Mouse position at drop:', mousePos);

      // Check if the food was dropped on the robot
      if (
        mousePos.x > robotRect.left &&
        mousePos.x < robotRect.right &&
        mousePos.y > robotRect.top &&
        mousePos.y < robotRect.bottom
      ) {
        console.log('Food dropped on the robot');
        setResult(
          selectedFood.isGood
            ? `${selectedFood.name} is good for the body!`
            : `${selectedFood.name} is not good for the body!`
        );

        // Replace the dropped food with a new random one not currently in 'foods'
        const remainingFoods = initialFoods.filter(
          (f) => !foods.some((food) => food.id === f.id)
        );

        let newFood;

        if (remainingFoods.length > 0) {
          newFood = remainingFoods[Math.floor(Math.random() * remainingFoods.length)];
          const newFoods = foods.map((f) =>
            f.id === selectedFood.id ? newFood : f
          );
          setFoods(newFoods);
        } else {
          // All foods have been used; reshuffle and select new foods
          const shuffledFoods = [...initialFoods].sort(() => 0.5 - Math.random());
          const selectedFoods = shuffledFoods.slice(0, 3);
          setFoods(selectedFoods);
        }
      } else {
        console.log('Food was not dropped on the robot');
        setResult('Oh no, you dropped the food!');
      }

      setSelectedFood(null); // Clear selected food after dropping
    }
  }, [selectedFood, isDragging, mousePos, foods]);

  // Handle food selection
  const handleFoodClick = (e, food) => {
    e.stopPropagation(); // Prevent the click event from reaching handleGlobalClick
    if (!selectedFood) {
      console.log('First click: selecting food', food);
      setSelectedFood(food); // Select food on first click
      setIsDragging(true); // Enable dragging
    }
  };

  // Attach event listener to track mouse movements and global clicks
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleGlobalClick);
      console.log('Dragging started');
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleGlobalClick);
      console.log('Dragging stopped');
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [isDragging, handleMouseMove, handleGlobalClick]);

  return (
    <div className="flex flex-col items-center justify-center h-screen relative">
      <h1 className="text-4xl font-bold mb-6">Good for the Body</h1>

      {/* Robot Image */}
      <div className="mb-8 relative">
        <img
          src="/robot.png"
          alt="Robot"
          id="robot"
          className="w-48 h-64 mx-auto"
          ref={robotRef} // Reference to the robot image
        />
      </div>

      {/* Display the Result */}
      <div className="text-2xl mb-6">
        {result && <p>{result}</p>}
      </div>

      {/* Food Options */}
      <div className="flex space-x-4">
        {foods.map((food) => (
          <img
            key={food.id}
            src={food.src}
            alt={food.name}
            className="w-20 h-20 cursor-pointer"
            onClick={(e) => handleFoodClick(e, food)}
          />
        ))}
      </div>

      {/* Dragging Food */}
      {selectedFood && isDragging && (
        <img
          src={selectedFood.src}
          alt={selectedFood.name}
          className="absolute w-20 h-20 pointer-events-none"
          style={{
            top: mousePos.y - 40, // Offset to center the image on the cursor
            left: mousePos.x - 40,
          }}
        />
      )}

      {/* Instructions */}
      <p className="text-lg mt-4">
        {selectedFood
          ? 'Click anywhere to drop the food!'
          : 'Click on a food to select it and drag it to the robot.'}
      </p>
    </div>
  );
}