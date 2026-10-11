import jwt from "jsonwebtoken";

// Generate JWT Token

const tokenGenerator = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

export default tokenGenerator;
