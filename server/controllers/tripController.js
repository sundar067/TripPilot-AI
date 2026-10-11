import groq from "../config/groq.js";
import Trip from "../models/Trip.js";
import State from "../models/State.js";
import Destination from "../models/Destination.js";
import createNotification from "../utils/createNotification.js";

const GROQ_MODEL = "openai/gpt-oss-20b";

// Escape special characters before searching with regex
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ==========================================
// Generate Trip Plan
// ==========================================
export const generateTripPlan = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers, tripType } =
      req.body;

    // Validate required fields
    if (
      typeof destination !== "string" ||
      !destination.trim() ||
      !startDate ||
      !endDate ||
      budget === undefined ||
      travelers === undefined ||
      !tripType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all trip details.",
      });
    }

    const budgetNumber = Number(budget);
    const travelerNumber = Number(travelers);

    if (
      !Number.isFinite(budgetNumber) ||
      budgetNumber <= 0 ||
      !Number.isInteger(travelerNumber) ||
      travelerNumber < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid budget and number of travellers.",
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid trip dates.",
      });
    }

    const destinationName = destination.trim();

    const destinationRegex = new RegExp(escapeRegex(destinationName), "i");

    // Find matching state
    let state = await State.findOne({
      name: destinationRegex,
    });

    // Find matching destination
    const matchedDestination = await Destination.findOne({
      name: destinationRegex,
    });

    if (!state && matchedDestination?.stateId) {
      state = await State.findById(matchedDestination.stateId);
    }

    // Get destination records
    let destinationRecords = [];

    if (state) {
      destinationRecords = await Destination.find({
        stateId: state._id,
      });
    } else if (matchedDestination) {
      destinationRecords = [matchedDestination];
    }

    const availablePlaces = destinationRecords.map((item) => item.name);

    // Budget category
    let budgetTier = "Low Budget";
    let placeCount = 3;
    let foodCount = 3;

    if (budgetNumber <= 10000) {
      budgetTier = "Low Budget";
    } else if (budgetNumber <= 30000) {
      budgetTier = "Standard Budget";
      placeCount = 5;
      foodCount = 4;
    } else if (budgetNumber <= 80000) {
      budgetTier = "Premium Budget";
      placeCount = 7;
      foodCount = 5;
    } else {
      budgetTier = "Luxury Budget";
      placeCount = 8;
      foodCount = 6;
    }

    // Multilingual itinerary prompt
    const prompt = `
You are TripPilot AI, a friendly multilingual travel planner.

Create a practical, realistic and easy-to-understand travel itinerary.

TRIP DETAILS
Destination: ${destinationName}
Start Date: ${startDate}
End Date: ${endDate}
Total Budget: INR ${budgetNumber}
Number of Travellers: ${travelerNumber}
Trip Type: ${tripType}
Budget Category: ${budgetTier}

AVAILABLE PLACES FROM OUR DATABASE
${
  availablePlaces.length > 0
    ? availablePlaces.join(", ")
    : "No matching destinations found in the database."
}

LANGUAGE RULES — VERY IMPORTANT

1. Support English, Hindi and Hinglish.
2. Automatically detect the language used by the user.
3. If the user writes in English, respond in simple English.
4. If the user writes in Hindi, respond in natural Hindi using Devanagari.
5. If the user writes in Hinglish, respond in natural Hinglish using English letters.
6. Keep the complete itinerary in the selected language style.
7. Do not force the user to choose a language.
8. If the language preference is unclear, use simple English.
9. Keep the language friendly, natural and easy to understand.
10. Preserve recognizable destination names and proper nouns.

TRAVEL PLANNING RULES

1. Use short sentences and clear headings.
2. Do not use Markdown tables.
3. Use simple bullet points and numbered lists.
4. Do not display raw table separators.
5. Recommend places only from the database list above.
6. Never invent database destinations.
7. Do not recommend hotels or claim hotel availability.
8. Do not guess the destination's city, state or location.
9. If the destination cannot be identified reliably, explain the issue
   in the same language style and ask for clarification.
10. Calculate trip duration from the supplied dates.
11. Include only the actual travel days.
12. Keep the estimated total within INR ${budgetNumber}.
13. Do not invent exact transport fares, entrance fees or prices.
14. Clearly label unverified costs as estimates.
15. Do not claim a place is open without verified information.
16. Personalize the plan for ${travelerNumber} traveller(s)
    and the trip type "${tripType}".
17. Do not force the traveller to spend the entire budget.
18. Avoid repeating the same information.
19. If no database destinations are available, say so honestly.
20. Do not include a hotel recommendation section.

RESPONSE FORMAT

Your Trip at a Glance
- Destination
- Travel dates
- Number of days
- Total budget

Your Day-wise Plan

Day 1: Short title
- Morning: Suggested activity
- Afternoon: Suggested activity
- Evening: Suggested activity

Create one section for each actual travel day.

Estimated Budget
- Transport: Estimate or check current fares
- Food: Clearly labelled estimate
- Activities: Estimate if reliable information exists
- Other expenses: Estimate if applicable
- Total estimated cost
- Remaining budget, if calculable

Places to Visit
- Place name and short explanation
- Use only available database destinations

Local Food to Try
- Food name and short explanation
- Do not invent restaurant names or exact prices

Useful Travel Tips
- Give 3 to 5 short, practical tips.

Translate all section headings and explanations into the detected
language. Keep the response concise, friendly and readable.
Do not present estimates as confirmed prices.
`;

    // Generate itinerary
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `
You are TripPilot AI.
Support English, Hindi and Hinglish.
Detect the language style and respond naturally in the same style.
Use simple formatting and never invent travel facts.
          `.trim(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_completion_tokens: 5000,
    });

    const response = completion.choices?.[0]?.message?.content?.trim();

    if (!response) {
      throw new Error("The AI returned an empty itinerary.");
    }

    // Save trip
    const savedTrip = await Trip.create({
      userId: req.user._id,
      destination: destinationName,
      startDate,
      endDate,
      budget: budgetNumber,
      travelers: travelerNumber,
      tripType,
      generatedPlan: response,
    });

    // Create notification
    await createNotification({
      userId: req.user._id,
      title: "Trip Generated Successfully",
      message: `Your trip to ${destinationName} has been generated successfully.`,
      type: "trip",
      audience: "user",
    });

    return res.status(200).json({
      success: true,
      tripPlan: response,
      trip: savedTrip,
    });
  } catch (error) {
    console.error("Generate Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate trip plan.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ==========================================
// Get My Trips
// ==========================================
export const getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({
      userId: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: trips.length,
      trips,
    });
  } catch (error) {
    console.error("Get My Trips Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trips.",
    });
  }
};

// ==========================================
// Get Trip By ID
// ==========================================
export const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    return res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error("Get Trip By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch trip details.",
    });
  }
};

// ==========================================
// Update Trip
// ==========================================
export const updateTrip = async (req, res) => {
  try {
    const { destination, startDate, endDate, budget, travelers, tripType } =
      req.body;

    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    if (
      typeof destination !== "string" ||
      !destination.trim() ||
      !startDate ||
      !endDate ||
      budget === undefined ||
      travelers === undefined ||
      !tripType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all trip details.",
      });
    }

    const budgetNumber = Number(budget);
    const travelerNumber = Number(travelers);
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      !Number.isFinite(budgetNumber) ||
      budgetNumber <= 0 ||
      !Number.isInteger(travelerNumber) ||
      travelerNumber < 1 ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid trip details.",
      });
    }

    trip.destination = destination.trim();
    trip.startDate = startDate;
    trip.endDate = endDate;
    trip.budget = budgetNumber;
    trip.travelers = travelerNumber;
    trip.tripType = tripType;

    await trip.save();

    await createNotification({
      userId: req.user._id,
      title: "Trip Updated",
      message: `Your trip to ${trip.destination} has been updated.`,
      type: "trip",
      audience: "user",
    });

    return res.status(200).json({
      success: true,
      message: "Trip updated successfully.",
      trip,
    });
  } catch (error) {
    console.error("Update Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update trip.",
    });
  }
};

// ==========================================
// Delete Trip
// ==========================================
export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const destination = trip.destination;

    await trip.deleteOne();

    await createNotification({
      userId: req.user._id,
      title: "Trip Deleted",
      message: `Your trip to ${destination} has been deleted.`,
      type: "trip",
      audience: "user",
    });

    return res.status(200).json({
      success: true,
      message: "Trip deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Trip Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete trip.",
    });
  }
};

// ==========================================
// Ask Question About Trip
// ==========================================
export const askTripQuestion = async (req, res) => {
  try {
    const { tripPlan, question } = req.body;

    if (
      typeof tripPlan !== "string" ||
      !tripPlan.trim() ||
      typeof question !== "string" ||
      !question.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Trip plan and question are required.",
      });
    }

    const prompt = `
You are TripPilot AI, a friendly multilingual travel assistant.

CURRENT TRIP PLAN:
${tripPlan}

USER QUESTION:
${question}

LANGUAGE RULES
1. Detect the language and writing style of the user's question.
2. English question: reply in simple English.
3. Hindi question: reply in natural Hindi using Devanagari script.
4. Hinglish question: reply in natural Hinglish using English letters.
5. Match the user's language style throughout the answer.
6. Do not force the user to select a language.

ANSWER RULES
- Keep the answer short, friendly and practical.
- Use bullet points where helpful.
- Do not use Markdown tables.
- Do not repeat the complete itinerary.
- Answer in the context of the current trip.
- Do not invent places, hotel availability, prices or timings.
- If information is unavailable, say it needs verification.
`;

    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `
You are TripPilot AI, a multilingual travel assistant.
Reply in the same language and writing style as the user's question.
Support English, Hindi and Hinglish.
Be concise, practical and honest.
          `.trim(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_completion_tokens: 1200,
    });

    const answer = completion.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error("The AI returned an empty answer.");
    }

    return res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Trip Chat Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to answer trip question.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
