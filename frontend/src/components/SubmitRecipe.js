import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SubmitRecipe = ({ currentUserEmail }) => {
    const [recipeName, setRecipeName] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [instructions, setInstructions] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newRecipe = {
            name: recipeName,
            ingredients,
            instructions,
            image_url: imageUrl,
            user: currentUserEmail, // Add the current user's email here
        };

        try {
            await axios.post('http://127.0.0.1:8000/recipe/', newRecipe);
            console.log(newRecipe);
            setMessage('Recipe submitted successfully!');
            setRecipeName('');
            setIngredients('');
            setInstructions('');
            setImageUrl('');
        } catch (error) {
            setMessage('There was an error submitting your recipe. Please try again.');
        }
    };

    return (
        <div className="submit-recipe">
            <h2>Submit Your Recipe</h2>
            <p>Share your favorite recipe with our community!</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="recipe-name">Recipe Name:</label>
                <input
                    type="text"
                    id="recipe-name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    required
                />

                <label htmlFor="ingredients">Ingredients:</label>
                <textarea
                    id="ingredients"
                    rows="4"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    required
                />

                <label htmlFor="instructions">Instructions:</label>
                <textarea
                    id="instructions"
                    rows="6"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    required
                />

                <label htmlFor="image-url">Image URL:</label>
                <input
                    type="url"
                    id="image-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />

                <button type="submit">Submit Recipe</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SubmitRecipe;
