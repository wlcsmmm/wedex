export default function VendorDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-charcoal mb-2">Vendor Detail</h1>
      <p className="text-charcoal/60 text-sm">ID: {params.id} — coming soon</p>
    </div>
  )
}
