import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Box, Typography, Avatar, Grid, Card, CardContent, CardMedia, CircularProgress } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; // Corrected import for useNavigate
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import KitchenIcon from "@mui/icons-material/Kitchen";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

// Create custom dark theme
const darkBlueTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1E3A8A",
    },
    background: {
      default: "#1e293b",
      paper: "#1e2a47",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a3b1c6",
    },
  },
});

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Use navigate for route navigation

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const profileResponse = await axios.get("http://127.0.0.1:8000/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const recipesResponse = await axios.get("http://127.0.0.1:8000/recipes/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfileData(profileResponse.data);
        setUserRecipes(recipesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile or recipes data:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle recipe click to show detailed info
  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`); // Navigate to the detailed recipe page
  };

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1e293b", // Dark background for the full screen
        }}
      >
        <Box
          sx={{
            width: "100%", 
            backgroundColor: "#233554",  // Lighter background color on the sides
            padding: { xs: "0", md: "0 10%" },  // Padding for the left and right sides
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress color="primary" size={60} />
          </Box>
        </Box>
      </Box>
    );
  }
  
  

  return (
    <ThemeProvider theme={darkBlueTheme}>
      <Box 
        sx={{ 
          width: "100%", 
          backgroundColor: "#233554", 
          padding: { xs: "0", md: "0 10%" } // No padding on xs (phones) and 5% on md and above (desktops)
        }}
      >

        <Box sx={{ width: "100%", backgroundColor: "#1e293b" }}> {/* Original dark background color */}
          <Container maxWidth="lg" sx={{ padding: "50px 16px" }}>
            {/* Profile Section */}
            <Box
              textAlign="center"
              mb={4}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column", // Center vertically
              }}
            >
              {/* Profile Image and Information */}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Avatar
                  src={profileData.profile_image}
                  alt="Profile"
                  sx={{
                    width: 100,
                    height: 100,
                    border: "3px solid #ffffff",
                    marginRight: 2, // Spacing between the image and text
                  }}
                />
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="h6" color="text.primary" sx={{ fontWeight: "bold" }}>
                    {profileData.username}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {profileData.email}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Recipes Section */}
            <Box>
              <Typography variant="h5" color="text.primary" gutterBottom textAlign="center">
                Your Recipes
              </Typography>
              {userRecipes.length === 0 ? (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  You haven't added any recipes yet.
                </Typography>
              ) : (
                <Grid container spacing={4} justifyContent="flex-start">
                  {userRecipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                      <Card
                        onClick={() => handleRecipeClick(recipe.id)} // Handle click for recipe detail
                        sx={{
                          borderRadius: "12px",
                          overflow: "hidden",
                          transition: "transform 0.3s, box-shadow 0.3s",
                          cursor: "pointer",
                          "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                          },
                          backgroundColor: "#1e2a47",
                          height: "100%",
                        }}
                      >
                        {/* Recipe Image */}
                        {recipe.image && (
                          <CardMedia
                            component="img"
                            alt={recipe.name}
                            image={recipe.image}
                            title={recipe.name}
                            sx={{
                              objectFit: "cover",
                              width: "100%",
                              height: 220, // Increased height for better image visibility
                            }}
                          />
                        )}
                        {/* Recipe Info */}
                        <CardContent>
                          <Typography variant="h6" color="text.primary" gutterBottom>
                            {recipe.name}
                          </Typography>

                          {/* Created At */}
                          <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
                            <CalendarTodayIcon sx={{ marginRight: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(recipe.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>

                          {/* Servings */}
                          <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
                            <KitchenIcon sx={{ marginRight: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {recipe.servings || "N/A"} servings
                            </Typography>
                          </Box>

                          {/* Cooking Time */}
                          <Box sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}>
                            <AccessTimeIcon sx={{ marginRight: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {recipe.prep_time || "N/A"} mins
                            </Typography>
                          </Box>

                          {/* Tags */}
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                            {/* <TagIcon sx={{ marginRight: 1 }} /> */}
                            {recipe.tags ? (
                              recipe.tags.split(",").map((tag, index) => (
                                <Typography
                                  key={index}
                                  variant="body2"
                                  sx={{
                                    display: "inline-block",
                                    backgroundColor: "#1E3A8A", // Blue background
                                    color: "#ffffff", // White text color
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                  }}
                                >
                                  #{tag.trim()}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="body2" color="text.secondary">N/A</Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;
