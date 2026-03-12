import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Scale, FileText, AlertTriangle, Flag, UserCheck, ArrowRight } from 'lucide-react';

export default function LawsuitSettings() {
  const settingsCards = [
    {
      title: 'Lawsuit Categories',
      description: 'Manage categories like Client, Class Action, Industry',
      icon: FileText,
      path: '/admin/settings/lawsuit-categories',
      color: 'blue'
    },
    {
      title: 'Lawsuit Types',
      description: 'Manage types like FCRA, FDCPA, FCBA, State Law Claims',
      icon: Scale,
      path: '/admin/settings/lawsuit-types',
      color: 'indigo'
    },
    {
      title: 'Legal Violations',
      description: 'Manage violation types and legal claims',
      icon: AlertTriangle,
      path: '/admin/settings/lawsuit-violations',
      color: 'red'
    },
    {
      title: 'Party Roles',
      description: 'Manage roles like Plaintiff, Defendant, Amicus Curiae',
      icon: UserCheck,
      path: '/admin/settings/party-roles',
      color: 'purple'
    },
    {
      title: 'Outcome Stages',
      description: 'Manage case status stages like Filed, Discovery, Settlement',
      icon: Flag,
      path: '/admin/settings/outcome-stages',
      color: 'green'
    }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lawsuit Configuration</h1>
        <p className="text-gray-600">
          Manage dropdown options and structured data for the lawsuit management system.
          These settings control what options appear in the lawsuit admin forms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
            red: 'bg-red-50 text-red-600 border-red-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            green: 'bg-green-50 text-green-600 border-green-200'
          };

          return (
            <Link key={card.path} to={card.path}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${colorClasses[card.color]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-blue-600 font-medium">
                    <span>Manage</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          About Structured Lawsuit Management
        </h3>
        <p className="text-gray-700 mb-3">
          The structured lawsuit system replaces free-form HTML fields with manageable dropdowns and multi-select options.
          This makes data more consistent, easier to filter, and better for SEO.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Categories: High-level classification of lawsuits</li>
          <li>Types: Legal claim types (can select multiple per lawsuit)</li>
          <li>Violations: Specific legal violations alleged (multi-select)</li>
          <li>Party Roles: Whether you're the plaintiff, defendant, etc.</li>
          <li>Outcome Stages: Current status or final outcome of the case</li>
        </ul>
      </div>
    </div>
  );
}
