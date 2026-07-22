// --- COLORS ---
export const PRIMARY_GREEN = "#0A8C4A";
export const SECONDARY_GOLD = "#F4A261";
export const BG = "#F8F9FA";
export const CARD = "#FFFFFF";
export const TEXT_DARK = "#1A1A1A";

// --- UTILITY FUNCTIONS ---
export function todayISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function naira(n) {
  if (n == null || isNaN(n)) return "₦0";
  const num = Math.round(Number(n));
  return "₦" + num.toLocaleString("en-NG");
}

// --- DATA FUNCTIONS ---
export function getFreshUserData() {
  return {
    username: "",
    name: "",
    surname: "",
    marketItems: ["Rice", "Beans", "Garri", "Tomatoes", "Oil"],
    marketLogs: [],
    generator: {
      fuelCostPerLiter: "",
      consumptionRate: "",
      appliances: { ac: false, fridge: false, tv: false, lights: false },
      // --- NEW: Utilities Fields ---
      utilities: {
        electricity: 0, // Prepaid token per month
        cableTV: 0, // DSTV/GOTV per month
        internet: 0, // WiFi/Data per month
        water: 0, // Water bill per month
        waste: 0, // Waste disposal per month
      },
      // --- Existing Daily & Business fields ---
      dailyTransport: 0,
      dailyFood: 0,
      dailyData: 0,
      dailyMisc: 0,
      bizRent: 0,
      bizStaff: 0,
      bizMaterials: 0,
      bizLogistics: 0,
    },
    trips: [],
    savings: {
      goalName: "",
      targetAmount: 0,
      savedAmount: 0,
      streak: 0,
      lastSavedDate: null,
      platform: "",
      dailySaveAmount: 2000,
    },
  };
}

// --- MARKET & GEOGRAPHY CONSTANTS ---
export const COMMON_MARKET_ITEMS = [
  "Maggi",
  "Salt",
  "Sugar",
  "Bread",
  "Milk",
  "Eggs",
  "Yam",
  "Onions",
  "Pepper",
  "Chicken",
  "Fish",
  "Spaghetti",
  "Indomie",
  "Detergent",
  "Cooking Gas",
];

export const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Other"];

export const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT (Abuja)",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "Savannah",
  "North East",
];

export const KENYA_COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Kiambu",
  "Machakos",
  "Kilifi",
  "Uasin Gishu",
  "Nyeri",
  "Kakamega",
  "Bungoma",
  "Meru",
  "Kwale",
  "Taita-Taveta",
  "Garissa",
  "Wajir",
  "Mandera",
  "Marsabit",
  "Turkana",
  "West Pokot",
  "Samburu",
  "Trans Nzoia",
  "Elgeyo-Marakwet",
  "Nandi",
  "Bomet",
  "Kericho",
  "Homa Bay",
  "Migori",
  "Kisii",
  "Nyamira",
  "Siaya",
  "Busia",
  "Vihiga",
  "Tharaka-Nithi",
  "Embu",
  "Kitui",
  "Makueni",
  "Laikipia",
  "Murang'a",
  "Kirinyaga",
  "Isiolo",
  "Lamu",
  "Tana River",
  "Narok",
  "Kajiado",
  "Nyandarua",
  "Laikipia",
];

export const SA_PROVINCES = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
];

export function getRegionsForCountry(country) {
  switch (country) {
    case "Nigeria":
      return NIGERIA_STATES;
    case "Ghana":
      return GHANA_REGIONS;
    case "Kenya":
      return KENYA_COUNTIES;
    case "South Africa":
      return SA_PROVINCES;
    default:
      return null;
  }
}
