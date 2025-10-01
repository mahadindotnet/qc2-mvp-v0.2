import ProductDesigner from '@/components/ProductDesigner'
import { HAT_CONFIG } from '@/lib/product-configs'

export default function HatPage() {
  return (
    <ProductDesigner
      config={HAT_CONFIG}
      productName="Custom Hat"
      heading="Order your Custom Hat"
      subheading="Send Us Your Concept Through The Form, And Our Expert Team Will Craft A Professional Design That's Ready To Print."
    />
  )
}
