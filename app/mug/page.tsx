import ProductDesigner from '@/components/ProductDesigner'
import { MUG_CONFIG } from '@/lib/product-configs'

export default function MugPage() {
  return (
    <ProductDesigner
      config={MUG_CONFIG}
      productName="Custom Mug"
      heading="Order your Custom Mug"
      subheading="Send Us Your Concept Through The Form, And Our Expert Team Will Craft A Professional Design That's Ready To Print."
    />
  )
}
