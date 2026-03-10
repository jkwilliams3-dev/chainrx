import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { Claim } from '../types';
import ClaimsTable from '../components/ClaimsTable';
import SlideOver from '../components/SlideOver';
import { useClaimsStore } from '../store/claimsStore';

export default function Claims() {
  const { claims } = useClaimsStore();
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const totalAmount = claims.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Claims</h1>
          <p className="text-sm text-slate-500 mt-1">
            {claims.length} total claims · ${(totalAmount / 1000000).toFixed(2)}M total value
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <FileText size={16} className="text-sky-500" />
          <span>All submitted claims</span>
        </div>
      </div>

      <ClaimsTable onSelectClaim={setSelectedClaim} />

      <SlideOver
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </div>
  );
}
