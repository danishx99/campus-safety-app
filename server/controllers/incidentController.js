const Incident = require("../schemas/Incident");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// exports.getIncidents = async (req, res) => {
//   try {
//     const incidents = await Incident.find();
//     res.json(incidents);
//   } catch (error) {
//     res.status(500).json({ error: "Error fetching incidents" });
//   }
// };

exports.reportIncident = async (req, res) => {
  //get jwt token from cookies
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const email = decoded.email;

  //for testing purposes, send email through req body?
  
  try {
    const { title, type, description, location, image } = req.body;
    const incident = new Incident({
      title,
      type,
      description,
      location,
      image,
      status: "pending",
      reportedBy: email,
    });
    await incident.save();
    res.status(201).json({ message: "Incident reported successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error reporting incident" });
  }
};
