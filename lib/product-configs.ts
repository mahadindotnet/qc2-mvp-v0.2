// Product configurations for the ProductDesigner component
// Add new products by creating new config objects here

export interface ProductConfig {
  name: string
  defaultColors: string[]
  sizes: string[]
  printTypes: string[]
  printAreas: Array<{
    id: string
    name: string
    price: number
  }>
  turnaroundOptions: Array<{
    label: string
    price: number
  }>
}

// T-Shirt Configuration
export const TSHIRT_CONFIG: ProductConfig = {
  name: 'Custom T-Shirt',
  defaultColors: [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ],
  sizes: [
    // Kids Sizes
    'Kids 2T', 'Kids 3T', 'Kids 4T',
    // Youth Sizes
    'Youth X-Small', 'Youth Small', 'Youth Medium', 'Youth Large',
    // Adult Sizes
    'Adult Small', 'Adult Medium', 'Adult X-Large', 'Adult 2XL',
    'Adult 3XL', 'Adult 4XL', 'Adult 5XL', 'Adult 6XL'
  ],
  printTypes: ['DTF (Direct to Film)', 'Sublimation'],
  printAreas: [
    { id: 'front', name: 'Only Front Side', price: 20.00 },
    { id: 'back', name: 'Only Back Side', price: 20.00 },
    { id: 'front-back', name: 'Front & Back', price: 35.00 },
    { id: 'right-sleeve', name: 'Right Sleeve', price: 5.00 },
    { id: 'left-sleeve', name: 'Left Sleeve', price: 5.00 }
  ],
  turnaroundOptions: [
    { label: 'Normal', price: 0.00 },
    { label: 'Same Day', price: 15.00 },
    { label: 'Rush (Less than 2 Hours)', price: 25.00 },
    { label: 'Express (Overnight)', price: 35.00 }
  ]
}

// Hoodie Configuration (Example)
export const HOODIE_CONFIG: ProductConfig = {
  name: 'Custom Hoodie',
  defaultColors: [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ],
  sizes: [
    'Small', 'Medium', 'Large', 'X-Large', '2XL', '3XL', '4XL'
  ],
  printTypes: ['DTF (Direct to Film)', 'Sublimation', 'Embroidery'],
  printAreas: [
    { id: 'front', name: 'Front Design', price: 25.00 },
    { id: 'back', name: 'Back Design', price: 25.00 },
    { id: 'front-back', name: 'Front & Back', price: 45.00 },
    { id: 'hood', name: 'Hood Design', price: 15.00 }
  ],
  turnaroundOptions: [
    { label: 'Normal', price: 0.00 },
    { label: 'Same Day', price: 20.00 },
    { label: 'Rush (Less than 2 Hours)', price: 30.00 },
    { label: 'Express (Overnight)', price: 40.00 }
  ]
}

// Mug Configuration (Example)
export const MUG_CONFIG: ProductConfig = {
  name: 'Custom Mug',
  defaultColors: [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ],
  sizes: [
    '11oz', '15oz', '20oz'
  ],
  printTypes: ['Sublimation', 'UV Printing'],
  printAreas: [
    { id: 'front', name: 'Front Design', price: 8.00 },
    { id: 'back', name: 'Back Design', price: 8.00 },
    { id: 'front-back', name: 'Front & Back', price: 12.00 },
    { id: 'handle', name: 'Handle Design', price: 5.00 }
  ],
  turnaroundOptions: [
    { label: 'Normal', price: 0.00 },
    { label: 'Same Day', price: 10.00 },
    { label: 'Rush (Less than 2 Hours)', price: 15.00 },
    { label: 'Express (Overnight)', price: 20.00 }
  ]
}

// Hat Configuration (Example)
export const HAT_CONFIG: ProductConfig = {
  name: 'Custom Hat',
  defaultColors: [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB', '#A52A2A'
  ],
  sizes: [
    'S/M', 'L/XL', 'One Size'
  ],
  printTypes: ['Embroidery', 'DTF (Direct to Film)'],
  printAreas: [
    { id: 'front', name: 'Front Logo', price: 12.00 },
    { id: 'back', name: 'Back Design', price: 12.00 },
    { id: 'side', name: 'Side Design', price: 8.00 }
  ],
  turnaroundOptions: [
    { label: 'Normal', price: 0.00 },
    { label: 'Same Day', price: 15.00 },
    { label: 'Rush (Less than 2 Hours)', price: 25.00 },
    { label: 'Express (Overnight)', price: 35.00 }
  ]
}

// Export all configurations
export const PRODUCT_CONFIGS = {
  tshirt: TSHIRT_CONFIG,
  hoodie: HOODIE_CONFIG,
  mug: MUG_CONFIG,
  hat: HAT_CONFIG
}

// Helper function to get config by product type
export function getProductConfig(productType: string): ProductConfig {
  return PRODUCT_CONFIGS[productType as keyof typeof PRODUCT_CONFIGS] || TSHIRT_CONFIG
}
