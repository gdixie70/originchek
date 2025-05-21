// utils/fetchCompanyInfo.js
export const fetchCompanyInfo = async (brandName) => {
    try {
      const response = await fetch(
        `https://api.opencorporates.com/v0.4/companies/search?q=${encodeURIComponent(brandName)}`
      );
  
      const data = await response.json();
  
      if (
        data?.results?.companies &&
        data.results.companies.length > 0
      ) {
        const company = data.results.companies[0]?.company;
        return {
          name: company?.name,
          jurisdiction: company?.jurisdiction_code,
          status: company?.current_status,
          companyNumber: company?.company_number,
          url: company?.opencorporates_url,
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Errore fetch da OpenCorporates:', error);
      return null;
    }
  };
  