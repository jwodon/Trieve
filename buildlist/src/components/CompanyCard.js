import React from 'react';

const CompanyCard = ({ logo, title, description, tags }) => {
    return (
        <div className="company-card">
            <img src={logo} alt="Company Logo" className="company-logo" />
            <div className="company-info">
                <h2>{title}</h2>
                <p>{description}</p>
                <div className="tags">
                    {tags.map((tag, index) => (
                        <span key={index} className="tag">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CompanyCard;
