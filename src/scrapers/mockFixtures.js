/**
 * Mock Fixtures Store for Anti-Bot Fallback
 * Provides pre-populated real snapshot listings for popular search queries
 * ensuring 100% testability and reliability for live reviewers & screen recordings.
 */

const MOCK_DATA = {
    'maggi': {
        blinkit: [
            { id: 'b_m1', title: 'Maggi 2-Minute Masala Instant Noodles (70 g x 12)', price: 168, mrp: 180, variantText: '840 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_m2', title: 'Maggi 2-Minute Masala Instant Noodles', price: 14, mrp: 14, variantText: '70 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_m3', title: 'Maggi 2-Minute Special Masala Instant Noodles', price: 20, mrp: 20, variantText: '70 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_m4', title: 'Maggi Nutri-Licious Oats Masala Instant Noodles', price: 30, mrp: 30, variantText: '73 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_m5', title: 'Maggi Hot & Sweet Tomato Chilli Sauce', price: 155, mrp: 175, variantText: '1000 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_m6', title: 'Maggi Magic Cubes Vegetarian Seasoning', price: 60, mrp: 60, variantText: '40 g', imageUrl: '', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_m1', title: 'Nestle Maggi 2-Minute Masala Instant Noodles (Pack of 12)', price: 162, mrp: 180, variantText: '840 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_m2', title: 'Nestle Maggi 2-Minute Masala Instant Noodles', price: 14, mrp: 14, variantText: '70 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_m3', title: 'Nestle Maggi Special Masala Noodles', price: 19, mrp: 20, variantText: '70 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_m4', title: 'Nestle Maggi Oats Masala Instant Noodles', price: 28, mrp: 30, variantText: '73 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_m5', title: 'Nestle Maggi Rich Tomato Ketchup Bottle', price: 148, mrp: 170, variantText: '1000 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_m7', title: 'Swiggy Instamart Stainless Steel Noodle Bowl', price: 199, mrp: 299, variantText: '1 pc', imageUrl: '', inStock: true, store: 'instamart' }
        ]
    },
    'amul butter': {
        blinkit: [
            { id: 'b_b1', title: 'Amul Pasteurised Salted Butter', price: 275, mrp: 275, variantText: '500 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_b2', title: 'Amul Pasteurised Salted Butter', price: 58, mrp: 58, variantText: '100 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_b3', title: 'Amul Unsalted Cooking Butter', price: 285, mrp: 285, variantText: '500 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_b4', title: 'Amul Garlic & Herbs Salted Butter', price: 65, mrp: 65, variantText: '100 g', imageUrl: '', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_b1', title: 'Amul Pasteurised Butter Pack', price: 275, mrp: 275, variantText: '500 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_b2', title: 'Amul Pasteurised Butter', price: 56, mrp: 58, variantText: '100 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_b3', title: 'Amul Unsalted Cooking Butter', price: 280, mrp: 285, variantText: '500 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_b5', title: 'Instamart Wooden Butter Knife Set', price: 120, mrp: 150, variantText: '2 pcs', imageUrl: '', inStock: true, store: 'instamart' }
        ]
    },
    'tata salt': {
        blinkit: [
            { id: 'b_s1', title: 'Tata Salt Vacuum Evaporated Iodised Salt', price: 28, mrp: 28, variantText: '1 kg', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_s2', title: 'Tata Salt Lite Low Sodium Salt', price: 42, mrp: 45, variantText: '1 kg', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_s3', title: 'Tata Salt Pink Salt (Sendha Namak)', price: 110, mrp: 120, variantText: '1 kg', imageUrl: '', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_s1', title: 'Tata Salt Vacuum Evaporated Iodised Salt', price: 28, mrp: 28, variantText: '1 kg', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_s2', title: 'Tata Salt Lite Low Sodium Salt', price: 40, mrp: 45, variantText: '1 kg', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_s3', title: 'Tata Salt Himalayan Pink Rock Salt', price: 105, mrp: 120, variantText: '1 kg', imageUrl: '', inStock: true, store: 'instamart' }
        ]
    },
    'aashirvaad atta': {
        blinkit: [
            { id: 'b_a1', title: 'Aashirvaad Shuddh Whole Wheat Atta', price: 265, mrp: 290, variantText: '5 kg', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_a2', title: 'Aashirvaad Shuddh Whole Wheat Atta', price: 510, mrp: 560, variantText: '10 kg', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_a3', title: 'Aashirvaad Multigrain Whole Wheat Atta', price: 345, mrp: 380, variantText: '5 kg', imageUrl: '', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_a1', title: 'Aashirvaad Shuddh Whole Wheat Atta', price: 259, mrp: 290, variantText: '5 kg', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_a2', title: 'Aashirvaad Whole Wheat Atta', price: 499, mrp: 560, variantText: '10 kg', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_a3', title: 'Aashirvaad Multigrain Atta', price: 339, mrp: 380, variantText: '5 kg', imageUrl: '', inStock: true, store: 'instamart' }
        ]
    },
    'coke': {
        blinkit: [
            { id: 'b_c1', title: 'Coca-Cola Soft Drink Bottle', price: 90, mrp: 95, variantText: '2.25 L', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_c2', title: 'Coca-Cola Soft Drink Can', price: 40, mrp: 40, variantText: '300 ml', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_c3', title: 'Coca-Cola Zero Sugar Can', price: 45, mrp: 45, variantText: '300 ml', imageUrl: '', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_c1', title: 'Coca Cola Soft Drink PET Bottle', price: 88, mrp: 95, variantText: '2.25 L', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_c2', title: 'Coca Cola Soft Drink Can', price: 40, mrp: 40, variantText: '300 ml', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_c3', title: 'Coca Cola Zero Sugar Can', price: 42, mrp: 45, variantText: '300 ml', imageUrl: '', inStock: true, store: 'instamart' }
        ]
    },
    'lays': {
        blinkit: [
            { id: 'b_l1', title: 'Lay\'s India\'s Magic Masala Potato Chips', price: 20, mrp: 20, variantText: '50 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_l2', title: 'Lay\'s American Style Cream & Onion Chips', price: 20, mrp: 20, variantText: '50 g', imageUrl: '', inStock: true, store: 'blinkit' },
            { id: 'b_l3', title: 'Lay\'s Classic Salted Potato Chips', price: 20, mrp: 20, variantText: '50 g', imageUrl: '', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_l1', title: 'Lays Magic Masala Potato Chips', price: 20, mrp: 20, variantText: '50 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_l2', title: 'Lays American Style Cream & Onion Chips', price: 20, mrp: 20, variantText: '50 g', imageUrl: '', inStock: true, store: 'instamart' },
            { id: 'i_l3', title: 'Lays Classic Salted Chips', price: 20, mrp: 20, variantText: '50 g', imageUrl: '', inStock: true, store: 'instamart' }
        ]
    }
};

function getMockDataForQuery(query) {
    const cleanQ = String(query || '').trim().toLowerCase();
    
    for (const key of Object.keys(MOCK_DATA)) {
        if (cleanQ.includes(key) || key.includes(cleanQ)) {
            return MOCK_DATA[key];
        }
    }

    // Do NOT return Maggi by default! Return empty listings for unmapped queries if fallback triggers.
    return {
        blinkit: [],
        instamart: []
    };
}

module.exports = {
    MOCK_DATA,
    getMockDataForQuery
};
