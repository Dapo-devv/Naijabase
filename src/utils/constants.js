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
  let date;
  if (iso.includes("T")) {
    date = new Date(iso);
  } else {
    const parts = iso.split("-");
    if (parts.length === 3) {
      date = new Date(
        Date.UTC(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
        ),
      );
    } else {
      date = new Date(iso);
    }
  }
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }
  return date.toLocaleDateString("en-NG", {
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
    email: "",
    phoneNumber: "", // New field
    timezone: "Africa/Lagos", // New field
    profilePicture: "",
    theme: "light", // Default theme
    loginAlerts: true, // New security setting
    marketItems: ["Rice", "Beans", "Garri", "Tomatoes", "Oil"],
    marketLogs: [],
    generator: {
      fuelCostPerLiter: "",
      consumptionRate: "",
      appliances: { ac: false, fridge: false, tv: false, lights: false },
      utilities: {
        electricity: 0,
        cableTV: 0,
        internet: 0,
        water: 0,
        waste: 0,
      },
      dailyTransport: 0,
      dailyFood: 0,
      dailyData: 0,
      dailyMisc: 0,
      bizRevenue: 0,
      bizMaterials: 0,
      bizLogistics: 0,
      bizStaff: 0,
      bizRent: 0,
      bizMarketing: 0,
      financeLogs: [],
      transactions: [],
      businessEntries: [],
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
