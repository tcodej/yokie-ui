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
        currentSong: false,
        infoSong: false,
        infoTags: [],
        playerImg: false,
        playerMsg: false,
        playerQueue: false
    };

    const [appState, setAppState] = useState(defaultState);

    const appAction = {};

    // whether or not to show the message-queue in playerPanel
    appAction.showMessage = () => {
        return (appState.playerImg || appState.playerMsg || appState.playerQueue) ? true : false;
    }

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
