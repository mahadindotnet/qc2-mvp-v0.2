import ProductDesigner from '@/components/ProductDesigner'
import { HOODIE_CONFIG } from '@/lib/product-configs'

export default function HoodiePage() {
  return (
    <ProductDesigner
      config={HOODIE_CONFIG}
      productName="Custom Hoodie"
      heading="Order your Custom Hoodie"
      subheading="Send Us Your Concept Through The Form, And Our Expert Team Will Craft A Professional Design That's Ready To Print."
    />
  )
}
