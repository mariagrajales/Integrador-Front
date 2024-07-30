
const ButtonLogin = ({ children, onClick }) => (
  <button
	type="submit"
	className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
	onClick={onClick}
  >
	{children}
  </button>
);

export default ButtonLogin;