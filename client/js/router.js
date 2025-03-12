// router.js - Client-side routing for SPA

export class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '';
        this.defaultRoute = '';

        // Initialize
        this.init();
    }

    init() {
        // Listen for hashchange events
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });
    }

    addRoute(route, handler) {
        this.routes[route] = handler;
    }

    setDefaultRoute(route) {
        this.defaultRoute = route;
    }

    navigate(route) {
        window.location.hash = route;
    }

    handleRouteChange() {
        // Get the route from the hash (removing the # symbol)
        const hash = window.location.hash.substring(1);

        // If hash is empty, use the default route
        const route = hash || this.defaultRoute;

        // If the route exists, call its handler
        if (this.routes[route]) {
            this.currentRoute = route;
            this.routes[route]();
        } else if (this.defaultRoute && this.routes[this.defaultRoute]) {
            // If route doesn't exist, navigate to default
            this.navigate(this.defaultRoute);
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}