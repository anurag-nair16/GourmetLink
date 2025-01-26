import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Box, Typography, Avatar, Grid, Card, CardContent, CardMedia, Button } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import backgroundImage from "../images/prof.jpg";

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

  if (loading) {
    return <Typography variant="h5" align="center">Loading...</Typography>;
  }


  return (
    <ThemeProvider theme={darkBlueTheme}>
      {/* Add global styles for the background image */}
      <style>
        {`
          body {
            background-image: url(${backgroundImage});
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            background-position: center;
            margin: 0;
            font-family: 'Roboto', sans-serif;
          }
        `}
      </style>


      <Container maxWidth="lg" sx={{ padding: "50px 16px", backgroundColor: "#1e293b" }}>
        {/* Profile Section */}
        <Box textAlign="center" mb={4} sx={{ position: "relative" }}>
          {/* Profile Banner */}
          <Box
            sx={{
              height: 150,
              backgroundColor: "#1E3A8A",
              borderRadius: "12px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                position: "absolute",
                bottom: 8,
                left: 16,
                color: "#ffffff",
                fontWeight: "bold",
              }}
            >
              {/* {profileData.username} */}
            </Typography>
          </Box>

          {/* Profile Image */}
          <Avatar
            src={profileData.profile_image}
            alt="Profile"
            sx={{
              width: 120,
              height: 120,
              marginTop: "-60px",
              marginLeft: "auto",
              marginRight: "auto",
              border: "3px solid #ffffff",
              zIndex: 1,
            }}
          />

          {/* Profile Information */}
          <Typography variant="h6" color="text.primary" sx={{ marginTop: 2 }}>
            {profileData.username}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {profileData.email}
          </Typography>
        </Box>

        {/* Recipes Section */}
        <Box>
          <Typography variant="h5" color="text.primary" gutterBottom>
            Your Recipes
          </Typography>
          {userRecipes.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              You haven't added any recipes yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {userRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                  <Card
                    sx={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      transition: "transform 0.3s",
                      "&:hover": { transform: "scale(1.05)" },
                      backgroundColor: "#1e2a47",
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
                          height: 200,
                          objectFit: "cover",
                        }}
                      />
                    )}

                    {/* Recipe Details */}
                    <CardContent>
                      <Typography variant="h6" color="text.primary" gutterBottom>
                        {recipe.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Ingredients:</strong> {recipe.ingredients}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Preparation Time:</strong> {recipe.prep_time || "N/A"} mins
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Cooking Time:</strong> {recipe.cook_time || "N/A"} mins
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Servings:</strong> {recipe.servings || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Created At:</strong> {new Date(recipe.created_at).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        <strong>Instructions:</strong> {recipe.instructions}
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          marginTop: 2,
                          backgroundColor: "#1E3A8A",
                          textTransform: "none",
                          "&:hover": { backgroundColor: "#0f2560" },
                        }}
                      >
                        View Recipe
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

            </Grid>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Profile;
