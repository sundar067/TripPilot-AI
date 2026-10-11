import { useState } from "react";

import { Lock, ChevronRight } from "lucide-react";

import ChangePasswordModal from "./ChangePasswordModal";

const SecuritySettings = () => {
  // Change password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-3xl font-bold leading-tight text-slate-900">
          Security
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Protect your account and manage your password.
        </p>
      </div>

      {/* Security Options */}
      <div>
        {/* Change Password */}
        <button
          type="button"
          onClick={() => setIsPasswordModalOpen(true)}
          className="group flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-slate-50"
        >
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Lock size={18} className="text-blue-500" />
            </div>

            {/* Text */}
            <div>
              <h3 className="text-base font-semibold leading-tight text-slate-900">
                Change Password
              </h3>

              <p className="mt-1 text-sm leading-tight text-slate-500">
                Update your account password securely.
              </p>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={18}
            className="shrink-0 text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-500"
          />
        </button>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default SecuritySettings;
