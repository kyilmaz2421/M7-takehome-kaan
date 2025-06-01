import React, { useEffect, useState } from "react";
import * as api from "../services/apiService";

const NursePreferences = ({ id, name, days }) => {
  // state for show depending on button click on the nurse itself to show details page
  const [showNursePreferredShifts, setShowNursePreferredShifts] =
    useState(false);
  // preferred shifts represents nurse preferences for the week in a format that makes it easy to render
  const [nursePreferredShifts, setNursePreferredShifts] = useState({
    Monday: "",
    Tuesday: "",
    Wednesday: "",
    Thursday: "",
    Friday: "",
    Saturday: "",
    Sunday: "",
  });
  const shifts = ["day", "night"];

  const handleClick = () => {
    setShowNursePreferredShifts((show) => !show);
  };

  const handleSubmitPreferences = (event) => {
    const setPreferences = async () => {
      const shiftValues = Object.values(preferredShifts);
      let shiftsToPost = shiftValues.map((shift, ind) => {
        return { dayOfWeek: days[ind], shift: shift };
      });
      shiftsToPost = shiftsToPost.filter((shiftDict) => shiftDict.shift !== "");
      // TODO: call the API to submit preferences
      console.error("Not yet implemented");
    };
    event.preventDefault();
    setPreferences().catch(console.error);
  };

  useEffect(() => {
    // converts the preferences from the API to the format that is used in the state of nursePreferredShifts
    const fetchPreferences = async () => {
      let nursePreferences = await api.default.getNursePreferences(id);
      if (!nursePreferences) {
        nursePreferences = [];
      }
      const newPreferredShifts = {
        Monday: "",
        Tuesday: "",
        Wednesday: "",
        Thursday: "",
        Friday: "",
        Saturday: "",
        Sunday: "",
      };
      nursePreferences.forEach((nursePreference) => {
        newPreferredShifts[nursePreference.dayOfWeek] = nursePreference.shift;
      });
      setNursePreferredShifts(newPreferredShifts);
    };
    fetchPreferences().catch(console.error);
  }, [id]);

  // changing the preferredShifts in the page depending on the checkboxes
  const handleChange = (event) => {
    for (const child of Array.from(event.currentTarget.children)) {
      if (child.type == "checkbox" && child.checked) {
        setNursePreferredShifts({
          ...nursePreferredShifts,
          [child.name]: child.value,
        });
        break;
      } else if (child.type == "checkbox") {
        setNursePreferredShifts({ ...nursePreferredShifts, [child.name]: "" });
      }
    }
  };

  return (
    <div>
      <button onClick={handleClick}>{name}</button>
      {showNursePreferredShifts && (
        <div>
          Pick at least 3 preferred shifts for the week:
          <form onSubmit={handleSubmitPreferences}>
            <table className="nurse-preferences">
              <thead>
                <tr>
                  <th>Day of the Week:</th>
                  <th>Type of Shift:</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={"preference for " + day + " nurse with id " + id}>
                    <td>{day}</td>
                    <td onChange={handleChange}>
                      {nursePreferredShifts[day] === shifts[0] ? (
                        <input
                          type="checkbox"
                          name={day}
                          value={shifts[0]}
                          checked
                        />
                      ) : (
                        <input type="checkbox" name={day} value={shifts[0]} />
                      )}
                      <label htmlFor={shifts[0]} style={{ marginRight: "5px" }}>
                        {shifts[0]}
                      </label>
                      {nursePreferredShifts[day] === shifts[1] ? (
                        <input
                          type="checkbox"
                          name={day}
                          value={shifts[1]}
                          checked
                        />
                      ) : (
                        <input type="checkbox" name={day} value={shifts[1]} />
                      )}
                      <label htmlFor={shifts[1]}>{shifts[1]}</label>
                      <br />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <input type="submit" name="submit" value="Submit" />
          </form>
        </div>
      )}
    </div>
  );
};

export default NursePreferences;
