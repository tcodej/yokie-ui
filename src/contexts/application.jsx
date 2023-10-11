import { useState, createContext, useContext } from 'react';

const ApplicationContext = createContext(null);

const ApplicationProvider = ({ children }) => {
    const defaultState = {
        isAdmin: false,
        showPrefs: false,
        queueSong: false,
        useProxy: false,
        message: '',
        prefs: {},
        currentSong: false
    };

    const [appState, setAppState] = useState(defaultState);
    const appAction = {};

    appAction.play = (song) => {
        console.log(song);
    }

    const reset = () => {
        setAppState(defaultState);
    }

    const updateAppState = (newVals) => {
        setAppState(prevVals => {
            return {
                ...prevVals,
                ...newVals
            };
        });
    }

    return (
        <ApplicationContext.Provider value={{appState, appAction, updateAppState}}>
            {children}
        </ApplicationContext.Provider>
    );
};

const useAppContext = () => useContext(ApplicationContext);

export { ApplicationContext, ApplicationProvider, useAppContext };
