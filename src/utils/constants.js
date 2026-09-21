// --- COLORS ---
export const PRIMARY_GREEN = "#0A8C4A";
export const SECONDARY_GOLD = "#F4A261";
export const BG = "#F8F9FA";
export const CARD = "#FFFFFF";
export const TEXT_DARK = "#1A1A1A";

// --- CURRENCY SYSTEM ---
export const CURRENCIES = [
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "GHS", symbol: "GH₵", name: "Ghanaian Cedi", flag: "🇬🇭" },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪" },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", flag: "🇪🇬" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿" },
];

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

export function getCurrencySymbol(code) {
  return getCurrency(code).symbol;
}

export function formatCurrency(amount, code = "NGN") {
  const symbol = getCurrencySymbol(code);
  if (amount == null || isNaN(amount)) return symbol + "0";
  const num = Math.round(Number(amount));
  return symbol + num.toLocaleString("en-US");
}

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
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Backward-compatibility alias
export function naira(n) {
  return formatCurrency(n, "NGN");
}

// --- DATA FUNCTIONS ---
export function getFreshUserData() {
  return {
    username: "",
    name: "",
    surname: "",
    email: "",
    phoneNumber: "",
    timezone: "Africa/Lagos", // Default timezone
    currency: "NGN", // 🟢 Default currency is Naira
    profilePicture: "",
    theme: "light",
    loginAlerts: true,
    marketItems: ["Rice", "Beans", "Bread", "Milk", "Cooking Oil"],
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

// --- COMMON MARKET ITEMS ---
export const COMMON_MARKET_ITEMS = [
  "Rice",
  "Beans",
  "Garri",
  "Bread",
  "Milk",
  "Eggs",
  "Tomatoes",
  "Onions",
  "Pepper",
  "Chicken",
  "Fish",
  "Spaghetti",
  "Indomie",
  "Detergent",
  "Cooking Gas",
];

// --- COUNTRIES & REGIONS (GLOBAL) ---
export const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "Egypt",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "India",
  "Japan",
  "China",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Brazil",
  "Mexico",
  "United Arab Emirates",
  "Saudi Arabia",
  "Singapore",
  "Malaysia",
  "Philippines",
  "Indonesia",
  "Turkey",
  "Other",
];

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

export const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export const UK_REGIONS = ["England", "Scotland", "Wales", "Northern Ireland"];

export const CANADA_PROVINCES = [
  "Alberta",
  "British Columbia",
  "Manitoba",
  "New Brunswick",
  "Newfoundland and Labrador",
  "Nova Scotia",
  "Ontario",
  "Prince Edward Island",
  "Quebec",
  "Saskatchewan",
  "Northwest Territories",
  "Nunavut",
  "Yukon",
];

export const AUSTRALIA_STATES = [
  "New South Wales",
  "Victoria",
  "Queensland",
  "Western Australia",
  "South Australia",
  "Tasmania",
  "Australian Capital Territory",
  "Northern Territory",
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
    case "United States":
      return US_STATES;
    case "United Kingdom":
      return UK_REGIONS;
    case "Canada":
      return CANADA_PROVINCES;
    case "Australia":
      return AUSTRALIA_STATES;
    default:
      return null;
  }
}
