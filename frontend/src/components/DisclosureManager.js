import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info, FileText, Users, CheckCircle } from 'lucide-react';

const DEFAULT_YMYL_DISCLOSURE = `Your Money or Your Life (YMYL) Content Notice

This article contains information that may impact your financial decisions and consumer rights. Google classifies such content as "Your Money or Your Life" (YMYL) and holds it to high standards of accuracy, expertise, and trustworthiness.

Key Points:
• Not Legal Advice: This content is for informational purposes only
• Consult Professionals: Seek qualified professional advice for your specific situation
• Based on Research: Information is based on current regulations and industry standards
• Subject to Change: Laws and regulations may change; verify current information

Last Updated: ${new Date().toLocaleDateString()}`;

const DEFAULT_COMPETITOR_DISCLOSURE = `Competitive Relationship Disclosure

The author/publisher operates in the same industry as some companies mentioned in this article. This competitive relationship is disclosed openly and does not diminish the factual accuracy of documented evidence.

• No False Claims: All factual claims are supported by documented evidence
• Consumer Protection Focus: Primary motivation is consumer protection and education
• No Financial Incentive: No compensation received from third parties for this content
• Transparency: This disclosure ensures readers can evaluate potential bias`;

const DEFAULT_CORRECTIONS_DISCLOSURE = `Corrections & Accountability Policy

We maintain the highest standards of factual accuracy and welcome corrections of any errors.

• Commitment to Accuracy: Proactive corrections when errors are identified
• Transparent Updates: All corrections noted with date and description
• Contact: Email corrections to [your email]
• Ongoing Review: Content regularly reviewed for accuracy

Report errors to ensure accurate information for all readers.`;

const DisclosureManager = ({ disclosures = {}, onChange }) => {
  const [localDisclosures, setLocalDisclosures] = useState({
    ymyl_enabled: false,
    ymyl_content: DEFAULT_YMYL_DISCLOSURE,
    general_disclosure_enabled: false,
    general_disclosure_type: 'affiliate',
    general_disclosure_content: '',
    competitor_disclosure_enabled: false,
    competitor_disclosure_content: DEFAULT_COMPETITOR_DISCLOSURE,
    corrections_enabled: false,
    corrections_content: DEFAULT_CORRECTIONS_DISCLOSURE,
    pseudonym_enabled: false,
    pseudonym_reason: 'nature_of_info',
    pseudonym_content: '',
    ...disclosures
  });

  useEffect(() => {
    onChange(localDisclosures);
  }, [localDisclosures]);

  const handleChange = (field, value) => {
    setLocalDisclosures(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* YMYL Disclosure */}
      <div className="border border-gray-200 rounded-lg p-6 bg-yellow-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">YMYL Content (Your Money Your Life)</h3>
              <p className="text-sm text-gray-600">For content affecting financial decisions or consumer rights</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localDisclosures.ymyl_enabled}
            onChange={(e) => handleChange('ymyl_enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </div>
        {localDisclosures.ymyl_enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YMYL Disclosure Content
            </label>
            <textarea
              value={localDisclosures.ymyl_content}
              onChange={(e) => handleChange('ymyl_content', e.target.value)}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter YMYL disclosure..."
            />
            <p className="mt-2 text-xs text-gray-500">
              This disclosure helps Google recognize your commitment to accuracy and expertise
            </p>
          </div>
        )}
      </div>

      {/* General Disclosure */}
      <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">General Disclosures</h3>
              <p className="text-sm text-gray-600">Affiliate links, sponsorships, or partnerships</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localDisclosures.general_disclosure_enabled}
            onChange={(e) => handleChange('general_disclosure_enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </div>
        {localDisclosures.general_disclosure_enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disclosure Type
              </label>
              <select
                value={localDisclosures.general_disclosure_type}
                onChange={(e) => handleChange('general_disclosure_type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="affiliate">Affiliate Disclosure</option>
                <option value="sponsored">Sponsored Content</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disclosure Content
              </label>
              <textarea
                value={localDisclosures.general_disclosure_content}
                onChange={(e) => handleChange('general_disclosure_content', e.target.value)}
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="This post contains affiliate links. We may earn a commission if you purchase through these links at no additional cost to you..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Competitor Disclosure */}
      <div className="border border-gray-200 rounded-lg p-6 bg-purple-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Competitor Disclosure</h3>
              <p className="text-sm text-gray-600">For content discussing competing businesses</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localDisclosures.competitor_disclosure_enabled}
            onChange={(e) => handleChange('competitor_disclosure_enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </div>
        {localDisclosures.competitor_disclosure_enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competitor Disclosure Content
            </label>
            <textarea
              value={localDisclosures.competitor_disclosure_content}
              onChange={(e) => handleChange('competitor_disclosure_content', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter competitor disclosure..."
            />
          </div>
        )}
      </div>

      {/* Corrections & Accountability */}
      <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Corrections & Accountability</h3>
              <p className="text-sm text-gray-600">Show commitment to accuracy and transparency</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localDisclosures.corrections_enabled}
            onChange={(e) => handleChange('corrections_enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </div>
        {localDisclosures.corrections_enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Corrections Policy Content
            </label>
            <textarea
              value={localDisclosures.corrections_content}
              onChange={(e) => handleChange('corrections_content', e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter corrections policy..."
            />
          </div>
        )}
      </div>

      {/* Pseudonym/Confidential Sources */}
      <div className="border border-gray-200 rounded-lg p-6 bg-orange-50">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pseudonym / Confidential Sources</h3>
              <p className="text-sm text-gray-600">Protect sources while maintaining transparency</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={localDisclosures.pseudonym_enabled}
            onChange={(e) => handleChange('pseudonym_enabled', e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded"
          />
        </div>
        {localDisclosures.pseudonym_enabled && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Protection
              </label>
              <select
                value={localDisclosures.pseudonym_reason}
                onChange={(e) => handleChange('pseudonym_reason', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="nature_of_info">Nature of Information Being Provided</option>
                <option value="speak_freely">Protected to Speak Freely</option>
                <option value="privacy">Privacy Protection</option>
                <option value="retaliation">Protection from Retaliation</option>
                <option value="other">Other Reason</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pseudonym Notice (Optional - leave blank for default)
              </label>
              <textarea
                value={localDisclosures.pseudonym_content}
                onChange={(e) => handleChange('pseudonym_content', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Leave blank to use default notice, or customize..."
              />
              <p className="mt-2 text-xs text-gray-500">
                Default: "Some names in this article have been changed to protect the privacy of individuals involved."
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisclosureManager;
