import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import SuiteComponent from "@/models/SuiteComponent";
import BookingCalculator from "@/components/BookingCalculator";
import UnitDetailFallback from "@/components/UnitDetailFallback";

export const dynamic = "force-dynamic";

export default async function UnitDetailPage({ params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
  } catch {
    return <UnitDetailFallback id={params.id} />;
  }
  const unit = await Unit.findById(params.id).lean();
  const components = await SuiteComponent.find({ unitId: params.id }).sort({ componentName: 1 }).lean();
  if (!unit) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="title">Unit not found</h1>
        </div>
      </section>
    );
  }
  const totalComponentArea = components.reduce((a, b) => a + (b.areaSqft || 0), 0);
  const bedroomCount = components.filter((c) => /bed/i.test(c.componentName)).length;
  const bathCount = components.filter((c) => /bath/i.test(c.componentName)).length;
  const balconyCount = components.filter((c) => /balcony/i.test(c.componentName)).length;
  const maxShares = (unit as any).maxShares || 0;
  const sharesSold = (unit as any).sharesSold || 0;
  const tsAllowed = unit.ownershipAllowed === "TimeShare" || unit.ownershipAllowed === "Both";
  const fullAllowed = unit.ownershipAllowed === "Full" || unit.ownershipAllowed === "Both";
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Unit {unit.unitCode}</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
            <div>Total size: {unit.totalAreaSqft} sqft</div>
            <div>Floor: {unit.floor}</div>
            <div>Quality: {unit.quality}</div>
            <div>View: {unit.viewType}</div>
            <div>Status: {unit.status}</div>
            <div>Size category: {unit.sizeCategory}</div>
            <div>Ownership: {unit.ownershipAllowed}</div>
            <div>Bedrooms: {bedroomCount}</div>
            <div>Baths: {bathCount}</div>
            <div>Balconies: {balconyCount}</div>
          </div>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
            <a href="/contact" className="roundedBtn" style={{ background: "var(--blue)", color: "#fff", padding: "10px 14px", fontWeight: 600 }}>
              Make an inquiry
            </a>
            <div style={{ marginTop: 12 }}>
              <h3 className="title">Ownership Options</h3>
              <div>Full Ownership: {fullAllowed ? "Available" : "Not available"}</div>
              <div>Time-Share: {tsAllowed ? "Available" : "Not available"}</div>
              {tsAllowed && (
                <>
                  <div>Shares remaining: {maxShares ? Math.max(0, maxShares - sharesSold) : 0}</div>
                  <div style={{ marginTop: 6 }}>Each time-share owner is entitled to 3 days per month and 36 days per year.</div>
                  <div style={{ marginTop: 6 }}>Stay entitlement can be booked in advance through booking calendar. Unused days cannot be carried over unless management allows.</div>
                </>
              )}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <h2 className="title">Suite Layout & Area Breakdown</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid rgba(11,60,93,0.1)", padding: 8 }}>Component</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid rgba(11,60,93,0.1)", padding: 8 }}>Area (sft)</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid rgba(11,60,93,0.1)", padding: 8 }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {components.map((c) => (
                <tr key={String(c._id)}>
                  <td style={{ borderBottom: "1px solid rgba(11,60,93,0.06)", padding: 8 }}>{c.componentName}</td>
                  <td style={{ borderBottom: "1px solid rgba(11,60,93,0.06)", padding: 8 }}>{c.areaSqft}</td>
                  <td style={{ borderBottom: "1px solid rgba(11,60,93,0.06)", padding: 8 }}>
                    <div style={{ width: "100%", background: "rgba(11,60,93,0.08)", height: 8, borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ width: `${Math.round((c.areaSqft / unit.totalAreaSqft) * 100)}%`, background: "var(--gold)", height: 8 }} />
                    </div>
                    <span style={{ marginLeft: 6 }}>{Math.round((c.areaSqft / unit.totalAreaSqft) * 100)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: 8 }}><strong>Total</strong></td>
                <td style={{ padding: 8 }}><strong>{totalComponentArea} sft</strong></td>
                <td style={{ padding: 8 }}><strong>Declared: {unit.totalAreaSqft} sft</strong></td>
              </tr>
            </tfoot>
          </table>
          {totalComponentArea > unit.totalAreaSqft && (
            <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5" }}>
              Component total area exceeds unit total area
            </div>
          )}
        </div>
        <BookingCalculator unitId={String(unit._id)} />
      </div>
    </section>
  );
}
