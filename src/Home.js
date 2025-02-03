import { Link } from 'react-router-dom';
const Home = () => {
    return (
        <div className="container d-flex flex-column align-items-center justify-content-center min-vh-100">
            <h1 className="display-4 mb-4 text-center">Welcome to <span className="gradient-text font-weight-bold"><h1>Z444++</h1></span></h1>
            <div className="d-grid gap-3 col-6 mx-auto">
                <Link to="/login/learner" className="btn btn-primary btn-lg">
                    Login as Learner
                </Link>
                <Link to="/login/guide" className="btn btn-secondary btn-lg">
                    Login as Guide
                </Link>
            </div>
        </div>
    );
}

export default Home;