import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';

interface InputProps {
  label: string;
  type: string;
  id: string;
  placeholder: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPasswordToggle?: boolean;
}

const Input = ({
  label,
  type,
  id,
  placeholder,
  required,
  onChange,
  showPasswordToggle = false
}: InputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordValue, setPasswordValue] = useState('');
  const [activeTips, setActiveTips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordValue(value); // Update password value

    if (onChange) onChange(e);

    // Simplified password strength logic
    let strength = 0;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasDigit = /[0-9]/.test(value);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(value);

    // Base score on length
    if (value.length >= 8) strength += 1; // Minimum length for fair/strong
    if (value.length >= 12) strength += 1; // Additional point for longer passwords

    // Add points for character variety
    if (hasUppercase) strength += 1;
    if (hasLowercase) strength += 1;
    if (hasDigit) strength += 1;
    if (hasSpecialChar) strength += 1;

    // Update the passwordStrength state based on score
    if (strength >= 5) setPasswordStrength(2); // Strong
    else if (strength >= 3) setPasswordStrength(1); // Fair
    else setPasswordStrength(0); // Weak

    // Set error if the password is too short
    const lengthError = value.length < 8 ? "Password must be at least 8 characters long." : null;
    setError(lengthError);

    // Update active tips based on password criteria, excluding length if error is set
    const tips = [];
    if (!hasUppercase) tips.push("Consider adding an uppercase letter.");
    if (!hasLowercase) tips.push("Consider adding a lowercase letter.");
    if (!hasDigit) tips.push("Consider adding a number.");
    if (!hasSpecialChar) tips.push("Consider adding a special character.");
    
    // Only add length recommendation if there’s no length error
    if (!lengthError && value.length < 8) tips.push("Password should be at least 8 characters long.");
    setActiveTips(tips);
  };

  // Define strength levels and colors for simplified logic
  const strengthText = ["Weak", "Fair", "Strong"];
  const strengthColor = ["bg-red-500", "bg-yellow-500", "bg-green-500"];

  return (
    <div className="mb-4 relative">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword && type === "password" ? "text" : type}
          id={id}
          name={id}
          placeholder={placeholder}
          required={required}
          onChange={type === "password" && label === "Password" ? handlePasswordChange : onChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            onMouseEnter={() => setIsTooltipVisible(true)} // Show tooltip on hover
            onMouseLeave={() => setIsTooltipVisible(false)} // Hide tooltip when not hovering
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />

            {/* Custom Tooltip */}
            {isTooltipVisible && (
              <span className="absolute left-[30px] px-2 py-1 text-xs text-white bg-black rounded-md shadow-lg whitespace-nowrap">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            )}
          </button>
        )}
      </div>
      
      {/* Password Strength Indicator */}
      {type === "password" && label === "Password" && passwordValue.length > 0 && (
        <div className="mt-2 flex items-center">
          <div className="w-full h-2 bg-gray-200 rounded-full relative">
            <div
              className={`h-2 rounded-full ${strengthColor[passwordStrength]}`}
              style={{
                width: passwordStrength === 0 ? "33%" : passwordStrength === 1 ? "66%" : "100%",
                transition: "width 0.3s ease-in-out" // Smooth transition for width
              }}
            ></div>
          </div>
          <span className="ml-3 text-sm text-gray-700">{strengthText[passwordStrength]}</span>
        </div>
      )}

      {/* Real-Time Password Tips */}
      {type === "password" && label === "Password" && activeTips.length > 0 && (
        <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
          {activeTips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default Input;