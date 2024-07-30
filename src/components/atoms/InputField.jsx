
const InputField = ({ label, id, name, type, required, value, onChange, className }) => (
	<div className={className}>
	  <label htmlFor={id} className="block text-sm font-medium text-gray-700">
		{label}
	  </label>
	  <input
		type={type}
		id={id}
		name={name}
		required={required}
		className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
		value={value}
		onChange={onChange}
	  />
	</div>
  );

export default InputField;