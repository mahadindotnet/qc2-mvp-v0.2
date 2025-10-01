'use client'


interface TShirtDesign {
  shirtColor: string
  printAreas: Array<{
    id: string
    name: string
    price: number
    selected: boolean
  }>
  size: string
  printType: string
  quantity: number
  turnaroundTime: {
    label: string
    price: number
  }
  designProof: string
  proofContactMethod: string
  contactDetails: string
  areaInstructions: Array<{
    areaId: string
    instructions: string
  }>
  textElements: Array<{
    id: string
    text: string
    color: string
    fontSize: number
    area: string
  }>
  imageElements: Array<{
    id: string
    imageUrl: string
    area: string
    width: number
    height: number
    fileName?: string
  }>
}

interface FrontBackCustomizationProps {
  design: TShirtDesign
  setDesign: (design: TShirtDesign | ((prev: TShirtDesign) => TShirtDesign)) => void
  imageUploadErrors: {[key: string]: string}
  setImageUploadErrors: (errors: {[key: string]: string} | ((prev: {[key: string]: string}) => {[key: string]: string})) => void
}

export default function FrontBackCustomization({ 
  design, 
  setDesign, 
  imageUploadErrors, 
  setImageUploadErrors 
}: FrontBackCustomizationProps) {
  return (
    <div className="mb-6">
      {/* Front Section */}
      <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
        <h4 className="text-md font-bold text-gray-900 mb-3">
          Front Side
        </h4>
        
        {/* Personalized Text Input for Front */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your personalized text for front
          </label>
          <textarea
            placeholder="Enter your custom text for front side..."
            className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium resize-none"
            rows={3}
            onChange={(e) => {
              setDesign(prev => ({
                ...prev,
                textElements: prev.textElements.map(el => 
                  el.area === 'front' ? { ...el, text: e.target.value } : el
                ).concat(
                  prev.textElements.find(el => el.area === 'front') 
                    ? [] 
                    : [{ id: 'front-text-'+Date.now(), text: e.target.value, color: '#000000', fontSize: 16, area: 'front' }]
                )
              }))
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Keep it short and impactful for best results
          </p>
        </div>

        {/* Image Upload for Front */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload image or design files for front <span className="text-red-500">*</span>
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            imageUploadErrors['front'] 
              ? 'border-red-500 bg-red-50' 
              : design.imageElements.filter(el => el.area === 'front').length > 0
                ? 'border-green-500 bg-green-50'
                : 'border-gray-400 hover:border-orange-500'
          }`}>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="image-upload-front"
              required
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length > 0) {
                  let hasErrors = false
                  
                  // Validate all files
                  files.forEach((file, index) => {
                    // Validate file size (10MB limit)
                    if (file.size > 10 * 1024 * 1024) {
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'front': `File ${index + 1} size must be less than 10MB`
                      }))
                      hasErrors = true
                      return
                    }
                    
                    // Validate file type - strict image validation
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
                    if (!allowedTypes.includes(file.type)) {
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'front': `File ${index + 1} must be a valid image file (JPG, PNG, GIF, WebP, SVG only)`
                      }))
                      hasErrors = true
                      return
                    }
                    
                    // Validate file extension matches MIME type
                    const fileExtension = file.name.split('.').pop()?.toLowerCase()
                    const expectedExtensions = {
                      'image/jpeg': ['jpg', 'jpeg'],
                      'image/png': ['png'],
                      'image/gif': ['gif'],
                      'image/webp': ['webp'],
                      'image/svg+xml': ['svg']
                    }
                    
                    if (fileExtension && expectedExtensions[file.type as keyof typeof expectedExtensions]) {
                      const validExtensions = expectedExtensions[file.type as keyof typeof expectedExtensions]
                      if (!validExtensions.includes(fileExtension)) {
                        setImageUploadErrors(prev => ({
                          ...prev,
                          'front': `File ${index + 1} has invalid extension for its type`
                        }))
                        hasErrors = true
                        return
                      }
                    }
                    
                    // Check for suspicious file names
                    const suspiciousPatterns = [
                      /\.(exe|bat|cmd|scr|pif|com)$/i,
                      /\.(js|vbs|jar|php|asp|jsp)$/i,
                      /\.(sh|ps1|psm1)$/i,
                      /script/i,
                      /virus/i,
                      /malware/i,
                      /trojan/i,
                      /backdoor/i
                    ]
                    
                    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'front': `File ${index + 1} has a suspicious name and cannot be uploaded`
                      }))
                      hasErrors = true
                      return
                    }
                    
                    // Check file size is reasonable (not too small for a real image)
                    if (file.size < 100) { // Less than 100 bytes is suspicious
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'front': `File ${index + 1} appears to be corrupted or invalid`
                      }))
                      hasErrors = true
                      return
                    }
                  })
                  
                  if (hasErrors) return
                  
                  // Clear any previous errors
                  setImageUploadErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors['front']
                    return newErrors
                  })
                  
                  // Process all files
                  files.forEach((file, index) => {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const newImageElement = {
                        id: `front-image-${Date.now()}-${index}`,
                        imageUrl: event.target?.result as string,
                        area: 'front',
                        width: 200,
                        height: 200,
                        fileName: file.name
                      }
                      
                      setDesign(prev => ({
                        ...prev,
                        imageElements: [...prev.imageElements, newImageElement]
                      }))
                    }
                    reader.readAsDataURL(file)
                  })
                }
              }}
            />
            <label htmlFor="image-upload-front" className="cursor-pointer">
              <div className="text-gray-500 mb-2">
                {design.imageElements.filter(el => el.area === 'front').length > 0 ? (
                  <svg className="mx-auto h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
              {design.imageElements.filter(el => el.area === 'front').length > 0 ? (
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    ✓ {design.imageElements.filter(el => el.area === 'front').length} image{design.imageElements.filter(el => el.area === 'front').length > 1 ? 's' : ''} uploaded
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    Click to add more images
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">
                    Click to upload multiple images or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              )}
            </label>
          </div>
          
          {/* Display uploaded images for front */}
          {design.imageElements.filter(el => el.area === 'front').length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {design.imageElements
                  .filter(el => el.area === 'front')
                  .map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.imageUrl}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() => {
                          setDesign(prev => ({
                            ...prev,
                            imageElements: prev.imageElements.filter(el => el.id !== image.id)
                          }))
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {image.fileName || `Image ${index + 1}`}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {imageUploadErrors['front'] && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {imageUploadErrors['front']}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            💡 High-resolution images with transparent backgrounds work best. You can upload multiple images for this print area.
          </p>
        </div>

        {/* Designer Instructions for Front */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Designer Instructions for Front Side
          </label>
          <textarea
            placeholder="Provide specific instructions for front side (e.g., font preferences, color schemes, placement details, special effects, etc.)"
            className="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium resize-none"
            rows={3}
            value={design.areaInstructions.find(inst => inst.areaId === 'front')?.instructions || ''}
            onChange={(e) => {
              setDesign(prev => ({
                ...prev,
                areaInstructions: prev.areaInstructions.find(inst => inst.areaId === 'front')
                  ? prev.areaInstructions.map(inst => 
                      inst.areaId === 'front' 
                        ? { ...inst, instructions: e.target.value }
                        : inst
                    )
                  : [...prev.areaInstructions, { areaId: 'front', instructions: e.target.value }]
              }))
            }}
          />
          <p className="text-xs text-green-600 mt-2">
            💡 Be as specific as possible to help our designers create exactly what you envision for the front side
          </p>
        </div>
      </div>

      {/* Back Section */}
      <div className="mb-6 p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
        <h4 className="text-md font-bold text-gray-900 mb-3">
          Back Side
        </h4>
        
        {/* Personalized Text Input for Back */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your personalized text for back
          </label>
          <textarea
            placeholder="Enter your custom text for back side..."
            className="w-full p-3 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900 font-medium resize-none"
            rows={3}
            onChange={(e) => {
              setDesign(prev => ({
                ...prev,
                textElements: prev.textElements.map(el => 
                  el.area === 'back' ? { ...el, text: e.target.value } : el
                ).concat(
                  prev.textElements.find(el => el.area === 'back') 
                    ? [] 
                    : [{ id: 'back-text-'+Date.now(), text: e.target.value, color: '#000000', fontSize: 16, area: 'back' }]
                )
              }))
            }}
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Keep it short and impactful for best results
          </p>
        </div>

        {/* Image Upload for Back */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload image or design files for back <span className="text-red-500">*</span>
          </label>
          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            imageUploadErrors['back'] 
              ? 'border-red-500 bg-red-50' 
              : design.imageElements.filter(el => el.area === 'back').length > 0
                ? 'border-green-500 bg-green-50'
                : 'border-gray-400 hover:border-orange-500'
          }`}>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="image-upload-back"
              required
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length > 0) {
                  let hasErrors = false
                  
                  // Validate all files (same validation as front)
                  files.forEach((file, index) => {
                    // Validate file size (10MB limit)
                    if (file.size > 10 * 1024 * 1024) {
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'back': `File ${index + 1} size must be less than 10MB`
                      }))
                      hasErrors = true
                      return
                    }
                    
                    // Validate file type - strict image validation
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
                    if (!allowedTypes.includes(file.type)) {
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'back': `File ${index + 1} must be a valid image file (JPG, PNG, GIF, WebP, SVG only)`
                      }))
                      hasErrors = true
                      return
                    }
                    
                    // Validate file extension matches MIME type
                    const fileExtension = file.name.split('.').pop()?.toLowerCase()
                    const expectedExtensions = {
                      'image/jpeg': ['jpg', 'jpeg'],
                      'image/png': ['png'],
                      'image/gif': ['gif'],
                      'image/webp': ['webp'],
                      'image/svg+xml': ['svg']
                    }
                    
                    if (fileExtension && expectedExtensions[file.type as keyof typeof expectedExtensions]) {
                      const validExtensions = expectedExtensions[file.type as keyof typeof expectedExtensions]
                      if (!validExtensions.includes(fileExtension)) {
                        setImageUploadErrors(prev => ({
                          ...prev,
                          'back': `File ${index + 1} has invalid extension for its type`
                        }))
                        hasErrors = true
                        return
                      }
                    }
                    
                    // Check for suspicious file names
                    const suspiciousPatterns = [
                      /\.(exe|bat|cmd|scr|pif|com)$/i,
                      /\.(js|vbs|jar|php|asp|jsp)$/i,
                      /\.(sh|ps1|psm1)$/i,
                      /script/i,
                      /virus/i,
                      /malware/i,
                      /trojan/i,
                      /backdoor/i
                    ]
                    
                    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'back': `File ${index + 1} has a suspicious name and cannot be uploaded`
                      }))
                      hasErrors = true
                      return
                    }
                    
                    // Check file size is reasonable (not too small for a real image)
                    if (file.size < 100) { // Less than 100 bytes is suspicious
                      setImageUploadErrors(prev => ({
                        ...prev,
                        'back': `File ${index + 1} appears to be corrupted or invalid`
                      }))
                      hasErrors = true
                      return
                    }
                  })
                  
                  if (hasErrors) return
                  
                  // Clear any previous errors
                  setImageUploadErrors(prev => {
                    const newErrors = { ...prev }
                    delete newErrors['back']
                    return newErrors
                  })
                  
                  // Process all files
                  files.forEach((file, index) => {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const newImageElement = {
                        id: `back-image-${Date.now()}-${index}`,
                        imageUrl: event.target?.result as string,
                        area: 'back',
                        width: 200,
                        height: 200,
                        fileName: file.name
                      }
                      
                      setDesign(prev => ({
                        ...prev,
                        imageElements: [...prev.imageElements, newImageElement]
                      }))
                    }
                    reader.readAsDataURL(file)
                  })
                }
              }}
            />
            <label htmlFor="image-upload-back" className="cursor-pointer">
              <div className="text-gray-500 mb-2">
                {design.imageElements.filter(el => el.area === 'back').length > 0 ? (
                  <svg className="mx-auto h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="mx-auto h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
              {design.imageElements.filter(el => el.area === 'back').length > 0 ? (
                <div>
                  <p className="text-sm text-green-600 font-medium">
                    ✓ {design.imageElements.filter(el => el.area === 'back').length} image{design.imageElements.filter(el => el.area === 'back').length > 1 ? 's' : ''} uploaded
                  </p>
                  <p className="text-xs text-green-500 mt-1">
                    Click to add more images
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600">
                    Click to upload multiple images or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                </div>
              )}
            </label>
          </div>
          
          {/* Display uploaded images for back */}
          {design.imageElements.filter(el => el.area === 'back').length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Images:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {design.imageElements
                  .filter(el => el.area === 'back')
                  .map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.imageUrl}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() => {
                          setDesign(prev => ({
                            ...prev,
                            imageElements: prev.imageElements.filter(el => el.id !== image.id)
                          }))
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {image.fileName || `Image ${index + 1}`}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
          
          {imageUploadErrors['back'] && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {imageUploadErrors['back']}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            💡 High-resolution images with transparent backgrounds work best. You can upload multiple images for this print area.
          </p>
        </div>

        {/* Designer Instructions for Back */}
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Designer Instructions for Back Side
          </label>
          <textarea
            placeholder="Provide specific instructions for back side (e.g., font preferences, color schemes, placement details, special effects, etc.)"
            className="w-full p-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 font-medium resize-none"
            rows={3}
            value={design.areaInstructions.find(inst => inst.areaId === 'back')?.instructions || ''}
            onChange={(e) => {
              setDesign(prev => ({
                ...prev,
                areaInstructions: prev.areaInstructions.find(inst => inst.areaId === 'back')
                  ? prev.areaInstructions.map(inst => 
                      inst.areaId === 'back' 
                        ? { ...inst, instructions: e.target.value }
                        : inst
                    )
                  : [...prev.areaInstructions, { areaId: 'back', instructions: e.target.value }]
              }))
            }}
          />
          <p className="text-xs text-green-600 mt-2">
            💡 Be as specific as possible to help our designers create exactly what you envision for the back side
          </p>
        </div>
      </div>
    </div>
  )
}
