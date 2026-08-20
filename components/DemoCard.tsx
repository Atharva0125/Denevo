import { CheckCircle2, Clock, Calendar } from 'lucide-react';

export default function DemoCard() {
  return (
    <section id="demo" className="py-5 px-6">
      <div className="bg-slate-50 border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">You typed</span>
          <div className="mt-1.5 bg-white border border-gray-200/80 rounded-2xl p-4 text-sm text-gray-800 italic leading-relaxed">
            “I'll send Rahul the quotation tomorrow morning.”
          </div>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Denevo detected</span>
          <div className="mt-1.5 bg-purple-50/90 border border-purple-100 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <span className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" /> Promise Created
              </span>
              <span className="text-xs bg-purple-200 text-purple-900 px-2.5 py-1 rounded-full font-semibold">
                Med Priority
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-400 text-xs block mb-0.5">Person</span>
                <span className="font-semibold text-gray-900 text-sm">Rahul</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-0.5">Action</span>
                <span className="font-semibold text-gray-900 text-sm">Send quotation</span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-0.5">Date</span>
                <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-500" /> Tomorrow
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-xs block mb-0.5">Time</span>
                <span className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-500" /> 10:00 AM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}