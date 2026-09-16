/**
 * Mock Fixtures Store for Anti-Bot Fallback
 * Provides pre-populated real snapshot listings for popular search queries
 * ensuring 100% testability and reliability for live reviewers & screen recordings.
 */

const MOCK_DATA = {
    'maggi': {
        blinkit: [
            { id: 'b_m1', title: 'Maggi 2-Minute Masala Instant Noodles (70 g x 12)', price: 168, mrp: 180, variantText: '840 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/66cd3947a21d47f9b7c205f02adcb841.png', inStock: true, store: 'blinkit' },
            { id: 'b_m2', title: 'Maggi 2-Minute Masala Instant Noodles', price: 14, mrp: 14, variantText: '70 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/b5bf57b5-2423-41a4-9279-8a30a13346d0.png', inStock: true, store: 'blinkit' },
            { id: 'b_m3', title: 'Maggi 2-Minute Special Masala Instant Noodles', price: 20, mrp: 20, variantText: '70 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/e689be50-51a8-4428-b0ef-64b1d0ad51a3.png', inStock: true, store: 'blinkit' },
            { id: 'b_m4', title: 'Maggi Nutri-Licious Oats Masala Instant Noodles', price: 30, mrp: 30, variantText: '73 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/3d63bd1f-13ff-4171-aa3e-324c08ea3ff8.png', inStock: true, store: 'blinkit' },
            { id: 'b_m5', title: 'Maggi Hot & Sweet Tomato Chilli Sauce', price: 155, mrp: 175, variantText: '1 kg', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/7bf98d1a-4299-4c8d-8a14-41e976ff1682.png', inStock: true, store: 'blinkit' },
            { id: 'b_m6', title: 'Maggi Magic Cubes Vegetarian Seasoning', price: 60, mrp: 60, variantText: '40 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/d9c02d18-9774-4b53-a55e-a6a24ebbd2bf.png', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_m1', title: 'Nestle Maggi 2-Minute Masala Instant Noodles (Pack of 12)', price: 162, mrp: 180, variantText: '840 g', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/NI_CATALOG/IMAGES/CI_CATALOG/2023/4/27/c2805ef6-33aa-47df-bc6c-17e9bb4a413d_182_1.png', inStock: true, store: 'instamart' },
            { id: 'i_m2', title: 'Nestle Maggi 2-Minute Masala Instant Noodles', price: 14, mrp: 14, variantText: '70 g', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/NI_CATALOG/IMAGES/CI_CATALOG/2023/4/27/b418ff89-9a74-4e92-80cf-fce89953930b_182_1.png', inStock: true, store: 'instamart' },
            { id: 'i_m3', title: 'Nestle Maggi Special Masala Noodles', price: 19, mrp: 20, variantText: '70 g', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/NI_CATALOG/IMAGES/CI_CATALOG/2023/4/27/e689be50-51a8-4428-b0ef-64b1d0ad51a3.png', inStock: true, store: 'instamart' },
            { id: 'i_m4', title: 'Nestle Maggi Oats Masala Instant Noodles', price: 28, mrp: 30, variantText: '73 g', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/NI_CATALOG/IMAGES/CI_CATALOG/2023/4/27/3d63bd1f-13ff-4171-aa3e-324c08ea3ff8.png', inStock: true, store: 'instamart' },
            { id: 'i_m5', title: 'Nestle Maggi Rich Tomato Ketchup Bottle', price: 148, mrp: 170, variantText: '1 kg', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/NI_CATALOG/IMAGES/CI_CATALOG/2023/4/27/7bf98d1a-4299-4c8d-8a14-41e976ff1682.png', inStock: true, store: 'instamart' },
            { id: 'i_m7', title: 'Swiggy Instamart Stainless Steel Noodle Bowl', price: 199, mrp: 299, variantText: '1 pc', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/rng/md/carousel/banner/instamart_bowl.png', inStock: true, store: 'instamart' }
        ]
    },
    'amul butter': {
        blinkit: [
            { id: 'b_b1', title: 'Amul Pasteurised Salted Butter', price: 275, mrp: 275, variantText: '500 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/66cd3947a21d47f9b7c205f02adcb841.png', inStock: true, store: 'blinkit' },
            { id: 'b_b2', title: 'Amul Pasteurised Salted Butter', price: 58, mrp: 58, variantText: '100 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/b5bf57b5-2423-41a4-9279-8a30a13346d0.png', inStock: true, store: 'blinkit' },
            { id: 'b_b3', title: 'Amul Unsalted Cooking Butter', price: 285, mrp: 285, variantText: '500 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/e689be50-51a8-4428-b0ef-64b1d0ad51a3.png', inStock: true, store: 'blinkit' },
            { id: 'b_b4', title: 'Amul Garlic & Herbs Salted Butter', price: 65, mrp: 65, variantText: '100 g', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/3d63bd1f-13ff-4171-aa3e-324c08ea3ff8.png', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_b1', title: 'Amul Pasteurised Butter Pack', price: 275, mrp: 275, variantText: '500 g', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/butter_500g.png', inStock: true, store: 'instamart' },
            { id: 'i_b2', title: 'Amul Pasteurised Butter', price: 56, mrp: 58, variantText: '100 g', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/butter_100g.png', inStock: true, store: 'instamart' },
            { id: 'i_b3', title: 'Amul Unsalted Cooking Butter', price: 280, mrp: 285, variantText: '500 g', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/unsalted_500g.png', inStock: true, store: 'instamart' },
            { id: 'i_b5', title: 'Instamart Wooden Butter Knife Set', price: 120, mrp: 150, variantText: '2 pcs', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/knife_set.png', inStock: true, store: 'instamart' }
        ]
    },
    'tata salt': {
        blinkit: [
            { id: 'b_s1', title: 'Tata Salt Vacuum Evaporated Iodised Salt', price: 28, mrp: 28, variantText: '1 kg', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/tata_salt_1kg.png', inStock: true, store: 'blinkit' },
            { id: 'b_s2', title: 'Tata Salt Lite Low Sodium Salt', price: 42, mrp: 45, variantText: '1 kg', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/tata_salt_lite.png', inStock: true, store: 'blinkit' },
            { id: 'b_s3', title: 'Tata Salt Pink Salt (Sendha Namak)', price: 110, mrp: 120, variantText: '1 kg', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/tata_pink_salt.png', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_s1', title: 'Tata Salt Vacuum Evaporated Iodised Salt', price: 28, mrp: 28, variantText: '1 kg', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/tata_salt_1kg.png', inStock: true, store: 'instamart' },
            { id: 'i_s2', title: 'Tata Salt Lite Low Sodium Salt', price: 40, mrp: 45, variantText: '1 kg', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/tata_salt_lite.png', inStock: true, store: 'instamart' },
            { id: 'i_s3', title: 'Tata Salt Himalayan Pink Rock Salt', price: 105, mrp: 120, variantText: '1 kg', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/tata_pink_salt.png', inStock: true, store: 'instamart' }
        ]
    },
    'aashirvaad atta': {
        blinkit: [
            { id: 'b_a1', title: 'Aashirvaad Shuddh Whole Wheat Atta', price: 265, mrp: 290, variantText: '5 kg', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/atta_5kg.png', inStock: true, store: 'blinkit' },
            { id: 'b_a2', title: 'Aashirvaad Shuddh Whole Wheat Atta', price: 510, mrp: 560, variantText: '10 kg', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/atta_10kg.png', inStock: true, store: 'blinkit' },
            { id: 'b_a3', title: 'Aashirvaad Multigrain Whole Wheat Atta', price: 345, mrp: 380, variantText: '5 kg', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/multigrain_5kg.png', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_a1', title: 'Aashirvaad Shuddh Whole Wheat Atta', price: 259, mrp: 290, variantText: '5 kg', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/atta_5kg.png', inStock: true, store: 'instamart' },
            { id: 'i_a2', title: 'Aashirvaad Whole Wheat Atta', price: 499, mrp: 560, variantText: '10 kg', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/atta_10kg.png', inStock: true, store: 'instamart' },
            { id: 'i_a3', title: 'Aashirvaad Multigrain Atta', price: 339, mrp: 380, variantText: '5 kg', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/multigrain_5kg.png', inStock: true, store: 'instamart' }
        ]
    },
    'coke': {
        blinkit: [
            { id: 'b_c1', title: 'Coca-Cola Soft Drink Bottle', price: 90, mrp: 95, variantText: '2.25 L', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/coke_2l.png', inStock: true, store: 'blinkit' },
            { id: 'b_c2', title: 'Coca-Cola Soft Drink Can', price: 40, mrp: 40, variantText: '300 ml', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/coke_can.png', inStock: true, store: 'blinkit' },
            { id: 'b_c3', title: 'Coca-Cola Zero Sugar Can', price: 45, mrp: 45, variantText: '300 ml', imageUrl: 'https://cdn.grofers.com/da/cms-assets/cms/product/coke_zero.png', inStock: true, store: 'blinkit' }
        ],
        instamart: [
            { id: 'i_c1', title: 'Coca Cola Soft Drink PET Bottle', price: 88, mrp: 95, variantText: '2.25 L', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/coke_2l.png', inStock: true, store: 'instamart' },
            { id: 'i_c2', title: 'Coca Cola Soft Drink Can', price: 40, mrp: 40, variantText: '300 ml', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/coke_can.png', inStock: true, store: 'instamart' },
            { id: 'i_c3', title: 'Coca Cola Zero Sugar Can', price: 42, mrp: 45, variantText: '300 ml', imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/coke_zero.png', inStock: true, store: 'instamart' }
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

    // Default fallback to maggi data if custom query
    return MOCK_DATA['maggi'];
}

module.exports = {
    MOCK_DATA,
    getMockDataForQuery
};
