import { createContext, FC, useContext, useEffect, useState } from "react";
import { localThemeEntry, browseThemeEntry } from "../customTypes";
import { Theme } from "../theme";

interface PublicCssLoaderState {
  localThemeList: Theme[];
  browseThemeList: browseThemeEntry[];
}

// The localThemeEntry interface refers to the theme data as given by the python function, the Theme class refers to a theme after it has been formatted and the generate function has been added

interface PublicCssLoaderContext extends PublicCssLoaderState {
  setLocalThemeList(listArr: localThemeEntry[]): void;
  setBrowseThemeList(listArr: browseThemeEntry[]): void;
}

// This class creates the getter and setter functions for all of the global state data.
export class CssLoaderState {
  private localThemeList: Theme[] = [];
  private browseThemeList: browseThemeEntry[] = [];

  // You can listen to this eventBus' 'stateUpdate' event and use that to trigger a useState or other function that causes a re-render
  public eventBus = new EventTarget();

  getPublicState() {
    return {
      localThemeList: this.localThemeList,
      browseThemeList: this.browseThemeList,
    };
  }

  setLocalThemeList(listArr: localThemeEntry[]) {
    let list: Theme[] = [];

    listArr.forEach((x: any) => {
      let theme = new Theme();
      theme.data = x;
      list.push(theme);
    });
    list.forEach((x) => x.init());

    // themeList_backup = list;
    this.localThemeList = list;
    this.forceUpdate();
  }

  setBrowseThemeList(listArr: browseThemeEntry[]) {
    this.browseThemeList = listArr;
    this.forceUpdate();
  }

  private forceUpdate() {
    this.eventBus.dispatchEvent(new Event("stateUpdate"));
  }
}

const CssLoaderContext = createContext<PublicCssLoaderContext>(null as any);
export const useCssLoaderState = () => useContext(CssLoaderContext);

interface ProviderProps {
  cssLoaderStateClass: CssLoaderState;
}

// This is a React Component that you can wrap multiple separate things in, as long as they both have used the same instance of the CssLoaderState class, they will have synced state
export const CssLoaderContextProvider: FC<ProviderProps> = ({
  children,
  cssLoaderStateClass,
}) => {
  const [publicState, setPublicState] = useState<PublicCssLoaderState>({
    ...cssLoaderStateClass.getPublicState(),
  });

  useEffect(() => {
    function onUpdate() {
      setPublicState({ ...cssLoaderStateClass.getPublicState() });
    }

    cssLoaderStateClass.eventBus.addEventListener("stateUpdate", onUpdate);

    return () =>
      cssLoaderStateClass.eventBus.removeEventListener("stateUpdate", onUpdate);
  }, []);

  const setLocalThemeList = (listArr: localThemeEntry[]) =>
    cssLoaderStateClass.setLocalThemeList(listArr);
  const setBrowseThemeList = (listArr: browseThemeEntry[]) =>
    cssLoaderStateClass.setBrowseThemeList(listArr);

  return (
    <CssLoaderContext.Provider
      value={{ ...publicState, setLocalThemeList, setBrowseThemeList }}>
      {children}
    </CssLoaderContext.Provider>
  );
};
