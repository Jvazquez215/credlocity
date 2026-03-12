import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Gavel, 
  Search, 
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Trophy,
  ChevronRight,
  Eye,
  Star,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { Slider } from '../../components/ui/slider';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Case Card Component
const CaseCard = ({ caseItem, onViewDetails, onPledge, onBid }) => {
  const getCategoryBadge = () => {
    switch (caseItem.category) {
      case 'bidding':
        return (
          <span className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
            <Trophy className="w-3 h-3" /> BIDDING OPEN
          </span>
        );
      case 'class_action':
        return (
          <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
            <Users className="w-3 h-3" /> CLASS ACTION
          </span>
        );
      default:
        return (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
            AVAILABLE
          </span>
        );
    }
  };

  const biddingInfo = caseItem.bidding_info;
  const hasBidding = caseItem.category === 'bidding' || caseItem.category === 'class_action';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            {getCategoryBadge()}
            {hasBidding && biddingInfo?.current_bid_count > 0 && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                {biddingInfo.current_bid_count} BIDS
              </span>
            )}
          </div>
          <span className="text-2xl font-bold text-green-600">
            {formatCurrency(caseItem.estimated_value)}
          </span>
        </div>

        {/* Bidding Deadline */}
        {hasBidding && biddingInfo?.bidding_deadline && (
          <div className="flex items-center gap-2 text-orange-600 text-sm mb-3">
            <Clock className="w-4 h-4" />
            Deadline: {new Date(biddingInfo.bidding_deadline).toLocaleDateString()}
          </div>
        )}

        {/* Title & ID */}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{caseItem.title}</h3>
        <p className="text-sm text-gray-500 mb-3">
          {caseItem.case_id} • {caseItem.type}
        </p>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {caseItem.description}
        </p>

        {/* Client Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>Client: {caseItem.client_display?.name || caseItem.client_name_display}</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {caseItem.client_display?.location || caseItem.client_location_display}
          </span>
        </div>

        {/* Current High Bid (for bidding cases) */}
        {hasBidding && biddingInfo?.highest_bid_amount > 0 && (
          <div className="bg-yellow-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-700 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> Current High Bid
              </span>
              <span className="font-bold text-yellow-700">
                {formatCurrency(biddingInfo.highest_bid_amount)}
              </span>
            </div>
          </div>
        )}

        {/* Practice Areas */}
        <div className="flex flex-wrap gap-2 mb-4">
          {caseItem.practice_areas?.slice(0, 3).map((area, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
              {area}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onViewDetails(caseItem)}>
            <Eye className="w-4 h-4 mr-2" /> View Details
          </Button>
          {hasBidding ? (
            <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={() => onBid(caseItem)}>
              <Trophy className="w-4 h-4 mr-2" /> Place Bid
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => onPledge(caseItem)}>
              <Gavel className="w-4 h-4 mr-2" /> Pledge Case
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Case Detail Modal
const CaseDetailModal = ({ caseItem, open, onClose }) => {
  if (!caseItem) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{caseItem.title}</DialogTitle>
          <DialogDescription>
            {caseItem.case_id} • {caseItem.type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Client</span>
              <p className="font-medium">{caseItem.client_display?.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Location</span>
              <p className="font-medium">{caseItem.client_display?.location}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Estimated Value</span>
              <p className="font-medium text-green-600">{formatCurrency(caseItem.estimated_value)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Jurisdiction</span>
              <p className="font-medium">{caseItem.jurisdiction}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-600">{caseItem.description}</p>
          </div>

          {/* Violations */}
          {caseItem.violations?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Legal Violations</h4>
              <ul className="space-y-2">
                {caseItem.violations.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-gray-600">{v.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Evidence Summary */}
          {caseItem.evidence_summary?.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Evidence Available</h4>
              <ul className="space-y-2">
                {caseItem.evidence_summary.map((e, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600">
                    <span className="text-lg">📄</span>
                    {e.description}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                <span className="text-lg">🔒</span>
                Full evidence available after case acceptance
              </p>
            </div>
          )}

          {/* Settlement Requirements */}
          {caseItem.settlement_requirements?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-5 h-5" />
                Required Settlement Conditions
              </h4>
              <ul className="space-y-3">
                {caseItem.settlement_requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      req.required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {req.required ? 'REQUIRED' : 'OPTIONAL'}
                    </span>
                    <div>
                      <p className="font-medium">{req.type?.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-600">{req.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fee Breakdown - Clear Distribution */}
          {caseItem.fee_breakdown && (
            <div className="space-y-3">
              <h4 className="font-medium">Settlement Distribution Breakdown</h4>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between font-medium mb-2">
                  <span>Estimated Settlement</span>
                  <span>{formatCurrency(caseItem.estimated_value)}</span>
                </div>
              </div>
              
              {/* Client Gets */}
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium text-green-800">Client Receives</span>
                    <p className="text-xs text-green-600">~67% (after attorney fees)</p>
                  </div>
                  <span className="font-bold text-green-700">
                    {formatCurrency(caseItem.estimated_value * 0.67)}
                  </span>
                </div>
              </div>
              
              {/* Attorney Gets */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium text-purple-800">Your Earnings</span>
                    <p className="text-xs text-purple-600">After Credlocity fees</p>
                  </div>
                  <span className="font-bold text-purple-700">
                    {formatCurrency(
                      (caseItem.estimated_value * 0.33) - 
                      caseItem.fee_breakdown.initial_fee - 
                      caseItem.fee_breakdown.commission_amount
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Contingency (33%)</span>
                    <span>{formatCurrency(caseItem.estimated_value * 0.33)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Less: Credlocity Fees</span>
                    <span>-{formatCurrency(caseItem.fee_breakdown.total_due)}</span>
                  </div>
                </div>
              </div>
              
              {/* Credlocity Gets */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex justify-between">
                  <div>
                    <span className="font-medium text-blue-800">Credlocity Receives</span>
                    <p className="text-xs text-blue-600">Referral fee + commission</p>
                  </div>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(caseItem.fee_breakdown.total_due)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span>${caseItem.fee_breakdown.initial_fee} fee + {(caseItem.fee_breakdown.total_rate * 100).toFixed(1)}% commission</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-400 italic text-center">
                *Based on typical 33% contingency. Client share depends on your fee agreement.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Bidding Modal
const BiddingModal = ({ caseItem, open, onClose, onSubmit, accountBalance }) => {
  const [upfrontBonus, setUpfrontBonus] = useState(0);
  const [commissionBonus, setCommissionBonus] = useState(0);
  const [clientBonus, setClientBonus] = useState(0);
  const [agreements, setAgreements] = useState({ terms: false, binding: false, reviewed: false });
  const [submitting, setSubmitting] = useState(false);

  if (!caseItem) return null;

  const estimatedValue = caseItem.estimated_value || 0;
  const standardInitialFee = 500;
  const standardCommissionRate = caseItem.fee_breakdown?.standard_rate || 0.05;

  // Calculate bid totals
  const totalInitial = standardInitialFee + upfrontBonus;
  const totalCommissionRate = standardCommissionRate + (commissionBonus / 100);
  const estimatedCommission = estimatedValue * totalCommissionRate;
  const totalBidValue = totalInitial + estimatedCommission;
  
  const isHighestBid = totalBidValue > (caseItem.bidding_info?.highest_bid_amount || 0);
  const hasInsufficientFunds = totalBidValue > accountBalance;
  const canSubmit = agreements.terms && agreements.binding && agreements.reviewed && !hasInsufficientFunds;

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({
      upfront_bonus: upfrontBonus,
      commission_bonus_percentage: commissionBonus / 100,
      client_bonus_percentage: clientBonus / 100
    });
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-orange-500" />
            Submit Your Bid
          </DialogTitle>
          <DialogDescription>
            {caseItem.case_id}: {caseItem.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Info */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm text-gray-500">Account Balance</span>
              <p className="font-bold text-lg">{formatCurrency(accountBalance)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Case Value</span>
              <p className="font-bold text-lg">{formatCurrency(estimatedValue)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Current Bids</span>
              <p className="font-bold text-lg">{caseItem.bidding_info?.current_bid_count || 0}</p>
            </div>
          </div>

          {/* Current Bids Display */}
          {caseItem.bidding_info?.highest_bid_amount > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-yellow-700 flex items-center gap-2">
                  <Trophy className="w-5 h-5" /> Current Highest Bid
                </span>
                <span className="font-bold text-yellow-700 text-xl">
                  {formatCurrency(caseItem.bidding_info.highest_bid_amount)}
                </span>
              </div>
            </div>
          )}

          {/* Bid Sliders */}
          <div className="space-y-6 p-4 border rounded-lg">
            <h4 className="font-medium">BUILD YOUR CUSTOM BID</h4>

            {/* Upfront Bonus */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">1️⃣ Additional Upfront Payment</label>
                <span className="font-bold">{formatCurrency(upfrontBonus)}</span>
              </div>
              <Slider
                value={[upfrontBonus]}
                onValueChange={(v) => setUpfrontBonus(v[0])}
                min={0}
                max={2500}
                step={50}
                className="my-4"
              />
              <p className="text-xs text-gray-500">Beyond standard $500 fee (Range: $0 - $2,500)</p>
            </div>

            {/* Commission Bonus */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">2️⃣ Additional Commission Points</label>
                <span className="font-bold">+{commissionBonus.toFixed(1)}%</span>
              </div>
              <Slider
                value={[commissionBonus]}
                onValueChange={(v) => setCommissionBonus(v[0])}
                min={0}
                max={15}
                step={0.5}
                className="my-4"
              />
              <p className="text-xs text-gray-500">Beyond standard commission rate (Range: 0% - 15%)</p>
            </div>

            {/* Client Bonus */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">3️⃣ Client Bonus Percentage</label>
                <span className="font-bold">+{clientBonus.toFixed(1)}%</span>
              </div>
              <Slider
                value={[clientBonus]}
                onValueChange={(v) => setClientBonus(v[0])}
                min={0}
                max={20}
                step={1}
                className="my-4"
              />
              <p className="text-xs text-gray-500">Give client extra from your share (Range: 0% - 20%)</p>
            </div>
          </div>

          {/* Bid Summary - Clear Distribution */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">SETTLEMENT DISTRIBUTION (Your Bid)</h4>
            
            {/* Estimated Settlement */}
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex justify-between font-medium">
                <span>Estimated Settlement</span>
                <span className="text-lg">{formatCurrency(estimatedValue)}</span>
              </div>
            </div>
            
            {/* Client Gets */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-green-800">Client Receives</span>
                  <p className="text-xs text-green-600">
                    67% + {clientBonus.toFixed(1)}% bonus from your share
                  </p>
                </div>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency((estimatedValue * 0.67) + (estimatedValue * 0.33 * (clientBonus / 100)))}
                </span>
              </div>
            </div>
            
            {/* Attorney Gets (You) */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-purple-800">Your Earnings</span>
                  <p className="text-xs text-purple-600">After all fees & bonuses</p>
                </div>
                <span className="text-lg font-bold text-purple-700">
                  {formatCurrency(
                    (estimatedValue * 0.33) - 
                    totalBidValue - 
                    (estimatedValue * 0.33 * (clientBonus / 100))
                  )}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Contingency (33%)</span>
                  <span>{formatCurrency(estimatedValue * 0.33)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Less: Credlocity Fees</span>
                  <span>-{formatCurrency(totalBidValue)}</span>
                </div>
                {clientBonus > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Less: Client Bonus ({clientBonus}%)</span>
                    <span>-{formatCurrency(estimatedValue * 0.33 * (clientBonus / 100))}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Credlocity Gets */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-blue-800">Credlocity Receives</span>
                  <p className="text-xs text-blue-600">Your total bid amount</p>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  {formatCurrency(totalBidValue)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Initial Fee ($500 + ${upfrontBonus} bonus)</span>
                  <span>{formatCurrency(totalInitial)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commission ({(totalCommissionRate * 100).toFixed(1)}%)</span>
                  <span>{formatCurrency(estimatedCommission)}</span>
                </div>
              </div>
            </div>
            
            {/* Account Balance Impact */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Your Account Balance</span>
                  <span>{formatCurrency(accountBalance)}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Reserved for Bid</span>
                  <span>-{formatCurrency(totalBidValue)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Remaining Balance</span>
                  <span className={hasInsufficientFunds ? 'text-red-600' : 'text-green-600'}>
                    {formatCurrency(accountBalance - totalBidValue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Competitive Positioning */}
          {isHighestBid ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">COMPETITIVE BID!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Your bid exceeds the current highest bid. You are positioned to WIN this case.
              </p>
            </div>
          ) : caseItem.bidding_info?.highest_bid_amount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">LOWER THAN CURRENT HIGH BID</span>
              </div>
              <p className="text-sm text-yellow-600 mt-1">
                Consider increasing to at least {formatCurrency(caseItem.bidding_info.highest_bid_amount + 100)} to be competitive.
              </p>
            </div>
          )}

          {/* Insufficient Funds Warning */}
          {hasInsufficientFunds && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <X className="w-5 h-5" />
                <span className="font-medium">INSUFFICIENT BALANCE</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Your bid exceeds your available balance. Please reduce your bid or add funds.
              </p>
              <Link to="/attorney/account/deposit">
                <Button variant="outline" size="sm" className="mt-2">Add Funds</Button>
              </Link>
            </div>
          )}

          {/* Terms Acceptance */}
          <div className="space-y-3 p-4 border rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.terms}
                onChange={(e) => setAgreements({ ...agreements, terms: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm">
                I understand that by submitting this bid, the total bid value ({formatCurrency(totalBidValue)}) 
                will be reserved against my account balance.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.binding}
                onChange={(e) => setAgreements({ ...agreements, binding: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm">
                I agree that this bid is binding for 7 days or until the bidding deadline, whichever comes first.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreements.reviewed}
                onChange={(e) => setAgreements({ ...agreements, reviewed: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm">
                I have reviewed the settlement requirements and fee structure.
              </span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!canSubmit || submitting}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {submitting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trophy className="w-4 h-4 mr-2" />
            )}
            Submit Bid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function CaseMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [accountBalance, setAccountBalance] = useState(0);
  const [activeAttorneys, setActiveAttorneys] = useState(0);
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [practiceArea, setPracticeArea] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Modals
  const [selectedCase, setSelectedCase] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);

  const getToken = () => localStorage.getItem('attorney_token');

  const fetchCases = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/marketplace/cases?sort_by=${sortBy}`;
      if (category !== 'all') url += `&category=${category}`;
      if (practiceArea !== 'all') url += `&practice_area=${practiceArea}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      
      if (response.status === 401) {
        navigate('/attorney/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
        setTotal(data.total || 0);
        if (data.network_stats?.active_attorneys) {
          setActiveAttorneys(data.network_stats.active_attorneys);
        }
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccount = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/attorney/account`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAccountBalance(data.balance || 0);
      }
    } catch (err) {
      console.error('Error fetching account:', err);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/attorney/login');
      return;
    }
    fetchCases();
    fetchAccount();
  }, [category, practiceArea, sortBy]);

  const handleViewDetails = async (caseItem) => {
    // Fetch full case details
    try {
      const response = await fetch(`${API_URL}/api/marketplace/cases/${caseItem.case_id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const fullCase = await response.json();
        setSelectedCase(fullCase);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching case details:', err);
    }
  };

  const handlePledge = (caseItem) => {
    // Navigate to pledge flow
    navigate(`/attorney/cases/${caseItem.case_id}/pledge`);
  };

  const handleBid = async (caseItem) => {
    // Fetch full case details with bids
    try {
      const response = await fetch(`${API_URL}/api/marketplace/cases/${caseItem.case_id}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const fullCase = await response.json();
        setSelectedCase(fullCase);
        setBidModalOpen(true);
      }
    } catch (err) {
      console.error('Error fetching case for bidding:', err);
    }
  };

  const handleSubmitBid = async (bidData) => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/cases/${selectedCase.case_id}/bid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bidData)
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Bid placed successfully! ${result.is_highest_bid ? 'You are the current highest bidder!' : ''}`);
        setBidModalOpen(false);
        fetchCases();
        fetchAccount();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to place bid');
      }
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('Failed to place bid');
    }
  };

  // Filter cases by category tab
  const filteredCases = cases;

  const standardCases = cases.filter(c => c.category === 'standard');
  const biddingCases = cases.filter(c => c.category === 'bidding');
  const classActionCases = cases.filter(c => c.category === 'class_action');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link to="/attorney" className="flex items-center gap-2">
                <Gavel className="w-8 h-8 text-purple-600" />
                <span className="text-xl font-bold">Attorney Portal</span>
              </Link>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/attorney" className="text-gray-600 hover:text-purple-600">Dashboard</Link>
              <Link to="/attorney/cases" className="text-gray-600 hover:text-purple-600">My Cases</Link>
              <Link to="/attorney/marketplace" className="text-purple-600 font-medium">Marketplace</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Case Marketplace</h1>
            <p className="text-gray-500 mt-1">Browse and bid on available legal cases</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-purple-600">Network Attorneys</p>
                <p className="text-lg font-bold text-purple-700">{activeAttorneys}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-green-600">Your Balance</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(accountBalance)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search cases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={practiceArea} onValueChange={setPracticeArea}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Practice Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Practice Areas</SelectItem>
                <SelectItem value="Consumer Law">Consumer Law</SelectItem>
                <SelectItem value="FDCPA">FDCPA</SelectItem>
                <SelectItem value="FCRA">FCRA</SelectItem>
                <SelectItem value="TCPA">TCPA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="value_high">Value: High to Low</SelectItem>
                <SelectItem value="value_low">Value: Low to High</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <Button
            variant={category === 'all' ? 'default' : 'outline'}
            onClick={() => setCategory('all')}
          >
            All Cases ({total})
          </Button>
          <Button
            variant={category === 'standard' ? 'default' : 'outline'}
            onClick={() => setCategory('standard')}
          >
            Standard Cases ({standardCases.length})
          </Button>
          <Button
            variant={category === 'bidding' ? 'default' : 'outline'}
            onClick={() => setCategory('bidding')}
            className={category === 'bidding' ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            <Trophy className="w-4 h-4 mr-1" />
            Bidding Cases ({biddingCases.length})
          </Button>
          <Button
            variant={category === 'class_action' ? 'default' : 'outline'}
            onClick={() => setCategory('class_action')}
            className={category === 'class_action' ? 'bg-purple-500 hover:bg-purple-600' : ''}
          >
            <Users className="w-4 h-4 mr-1" />
            Class Actions ({classActionCases.length})
          </Button>
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.case_id}
                caseItem={caseItem}
                onViewDetails={handleViewDetails}
                onPledge={handlePledge}
                onBid={handleBid}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Gavel className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No cases available</h3>
            <p className="text-gray-500 mt-1">Check back later for new cases</p>
          </div>
        )}
      </main>

      {/* Modals */}
      <CaseDetailModal
        caseItem={selectedCase}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
      
      <BiddingModal
        caseItem={selectedCase}
        open={bidModalOpen}
        onClose={() => setBidModalOpen(false)}
        onSubmit={handleSubmitBid}
        accountBalance={accountBalance}
      />
    </div>
  );
}
