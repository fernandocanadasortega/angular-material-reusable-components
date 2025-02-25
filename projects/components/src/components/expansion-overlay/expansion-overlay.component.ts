import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, ViewChild } from '@angular/core';


@Component({
  selector: 'expansion-overlay',
  templateUrl: './expansion-overlay.component.html',
  styleUrls: ['./expansion-overlay.component.scss'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExpansionOverlay implements AfterViewInit {

  /** Opciones posibles: 'true' | 'false' (default). Indica si expansion-overlay NO sera overlay, sino que empujará al contenido inferior (No tiene position: absolute). ¡¡PARA PODER UTILIZAR EN CONJUNTO CON 'verticalAlign: top' HAY QUE CAMBIAR 'baseComponent' --> 'baseComponentPushTop'!! */
  @Input() pushMode: boolean = false;
  /** Opciones posibles: 'true' | 'false' (default). Indica si expansion-overlay se ajustará al width del elemento baseComponent. */
  @Input() useBaseComponentWidth: boolean = false;
  /** Opciones posibles: 'true' | 'false' (default). Indica si expansion-overlay ocultará el border-radius del elemento baseComponent cuando se despliegue, es solo un cambio estético para que no se vea un borde redondeado y luego el expansion-overlay. */
  @Input() baseComponentHideRoundBorders: boolean = false;
  /** Opciones posibles: 'left' (default) | 'middle' | 'right'. Indica donde se alineará el expansion-overlay en el eje X, por ejemplo si se alinea 'left' el expansion-overlay se pegará a la izquierda y si necesita más espacio crecerá hacia la derecha. */
  @Input() horizontalAlign: 'left' | 'middle' | 'right' = 'right';
  /** Opciones posibles: 'top' | 'bottom' (default). Indica donde se alineará el expansion-overlay en el eje Y, por ejemplo si se alinea 'top' el expansion-overlay se colocará por encima del elemento baseComponent y la animación de expandirse será de abajo hacia arriba. */
  @Input() verticalAlign: 'top' | 'bottom' = 'bottom';
  /** Valores de ejemplo: '0.25s' | '250ms' (0.25s default). Indica el tiempo de la animación de despliegue del expansion-overlay. */
  @Input() animationDuration: string = '0.25s';
  /** Opciones posibles: 'true' | 'false' (default). Indica si el componente backdrop debe aparecer cuando se despliegue el expansion-overlay. */
  @Input() showBackdrop: boolean = false;

  /** Referencia del primer contenido proyectado con 'baseComponent' */
  @ViewChild('baseComponentWrapper') baseComponent?: ElementRef;
  /** Referencia del primer contenido proyectado con 'expansionComponent' */
  @ViewChild('expansionComponentWrapper') expansionComponent?: ElementRef;
  /** Referencia del backdrop, solo disponible cuando showBackdrop=true */
  @ViewChild('backdrop') backdrop?: ElementRef;

  /** Componente baseComponent proyectado, el que se envía desde el componente que llama a expansion-overlay */
  private baseProyectedComponent: HTMLElement | null = null;
  /** Componente expansionComponent proyectado, el que se envía desde el componente que llama a expansion-overlay */
  private expansionProyectedComponent: HTMLElement | null = null;
  protected isExpanded: boolean = false;

  constructor() { }

  /**
   * Carga la propiedades principales del componente.
   * @returns {void} El return solo existe para salir del método cuando no se encuentra el componente proyectado.
   */
  ngAfterViewInit() {
    // Comprobar si se ha proyectado el componente baseComponent
    if (!this.baseComponent || !this.baseComponent.nativeElement) {
      console.error('No se encontró el elemento baseComponent proyectado.');
      return;
    }

    // Comprobar si se ha proyectado el componente expansionComponent
    if (!this.expansionComponent || !this.expansionComponent.nativeElement) {
      console.error('No se encontró el elemento expansionComponent proyectado.');
      return;
    }

    this.expansionComponent.nativeElement.style.transition = `max-height ${this.animationDuration} ease-out`; // Animación responsable del colapso y despliegue del componente
    if (this.pushMode) { // Se establece el modo push del componente expansionComponent
      this.expansionComponent!.nativeElement.style.position = 'relative'; // Se elimina el position: absolute que viene por defecto en el componente expansionComponent.
    }

    // Se añade un setTimeout para que los componentes baseComponent y expansionComponent tengan tiempo de renderizarse y poder obtener sus valores.
    setTimeout(async () => {
      // Comprobar si se han proyectado los componentes baseComponent y expansionComponent
      if (!this.getBaseProyectedComponent() || !this.getExpansionProyectedComponent()) {
        return;
      }

      if (this.showBackdrop) {
        const scrollElement = await this.getScrollElement();
        this.baseComponent!.nativeElement.style.zIndex = '1001'; // Se establece el z-index del componente baseComponent a 1001 para que esté por encima del backdrop.
        this.expansionComponent!.nativeElement.style.zIndex = '1001'; // Se establece el z-index del componente baseComponent a 1001 para que esté por encima del backdrop.
        this.backdrop!.nativeElement.style.height = `${scrollElement?.scrollHeight}px`; // Se ajusta el height del componente backdrop al height de la pantalla.
      }

      if (this.useBaseComponentWidth || this.pushMode) {
        this.baseComponent!.nativeElement.style.width = `${this.baseProyectedComponent!.offsetWidth}px`; // Se ajusta el width del componente baseComponent al width del componente baseComponent.
        this.expansionComponent!.nativeElement.style.width = `${this.baseProyectedComponent!.offsetWidth}px`; // Se ajusta el width del componente expansionComponent al width del componente baseComponent.
      }
    });
  }

  /**
   * Realiza los cálculos de donde debe mostrar el overlay y activa la animación de aparición o desaparición del overlay al hacer click en el componente baseComponent.
   * @returns
   */
  async toggleOverlayExpansion() {
    // Comprobar si se han proyectado los componentes baseComponent y expansionComponent
    if (!this.getBaseProyectedComponent() || !this.getExpansionProyectedComponent()) {
      return;
    }

    // Indica si el overlay se va a mostrar o a ocultar
    this.isExpanded = this.isExpanded ? false : true;

    // Actualiza la posición del overlay (No se actualiza la posición en modo push)
    if (!this.pushMode) {
      if (!this.useBaseComponentWidth) { // Actualiza la posición del eje X (No se actualiza la posición en modo push ni si está activo useBaseComponentWidth)
        await this.updateHorizontalAlign();
        await this.updateHorizontalAlign(); // Es necesario recalcular la posición porque POR ALGUNA PUTA RAZÓN el valor de this.expansionComponent?.nativeElement.offsetWidth no está actualizado la primera vez en algunos casos especificos (El único caso en el que he detectado esto es cuando un label no tiene white-space: nowrap; y tiene que recalcular si tiene que hacer salto de línea por falta de pantalla o no). idk
      }

      await this.updateVerticalAlign();
    }

    if (this.showBackdrop) {
      this.backdrop!.nativeElement.classList.toggle('activated');
    }

    // Muestra u oculta el overlay
    this.expansionComponent!.nativeElement.style.maxHeight = this.isExpanded ? `${this.expansionProyectedComponent!.offsetHeight}px` : '0px';
  }

  //#region UPDATE HORIZONTAL ALIGN
  /**
   * Actualiza la posición horizontal del componente overlayContainer.
   *
   * Cuando se establece la posición del horizontal-align se realiza un cálculo para comprobar si el overlayContainer se saldrá de la pantalla por overflow.
   * Si el componente overlayContainer sufre overflow se realizan cálculos para comprobar que horizontal-align sufre menos overflow.
   *
   * @returns {void} El return solo existe para salir del método cuando no se encuentra el componente del atributo expand-from-item en el DOM.
   */
  async updateHorizontalAlign() {
    if (!this.isExpanded) { // No se realizan actualizaciones de ubicación al cerrar el overlay
      return;
    }

    // Calculos del expansion-overlay en las diferentes posiciones posibles de horizontalAlign
    const horizontalCalculations: { left: number, middle: number, right: number } = {
      left: this.baseComponent?.nativeElement.getBoundingClientRect().left,
      right: window.innerWidth - this.baseComponent?.nativeElement.getBoundingClientRect().right,
      middle: this.baseComponent?.nativeElement.getBoundingClientRect().left + ((this.baseComponent?.nativeElement.offsetWidth / 2) - (this.expansionComponent?.nativeElement.offsetWidth / 2))
    };

    let horizontalAlign = this.horizontalAlign;
    horizontalAlign = await this.checkHorizontalAlignAvailability(horizontalAlign, horizontalCalculations); // Se realizan los cálculos para ver si el componente overlayContainer se saldrá de la pantalla por overflow

    // La parte izquierda del expansion-overlay se alinea con la parte izquierda del componente baseComponent
    if (horizontalAlign == 'left') {
      this.expansionComponent!.nativeElement.style.left = `${horizontalCalculations.left}px`;
      this.expansionComponent!.nativeElement.style.right = 'unset';
      return;
    }

    // La parte derecha del expansion-overlay se alinea con la parte derecha del componente baseComponent
    if (horizontalAlign == 'right') {
      this.expansionComponent!.nativeElement.style.left = 'unset';
      this.expansionComponent!.nativeElement.style.right = `${horizontalCalculations.right}px`;
      return;
    }

    // La parte media del expansion-overlay se alinea con la parte media del componente baseComponent
    if (horizontalAlign == 'middle') {
      this.expansionComponent!.nativeElement.style.left = `${horizontalCalculations.middle}px`;
      this.expansionComponent!.nativeElement.style.right = 'unset';
      return;
    }
  }

  /**
   * Realiza un cálculo para comprobar si el overlayContainer se saldrá de la pantalla por overflow.
   * Si el componente overlayContainer sufre overflow se realizan cálculos para comprobar que horizontal-align sufre menos overflow.
   * @param {'left' | 'middle' | 'right'} horizontalAlign Posición original / por defecto del atributo horizontal-align.
   * @returns {Promise<'left' | 'middle' | 'right'>} Valor definitivo del horizontalAlign tras hacer los cálculos.
   */
  async checkHorizontalAlignAvailability(horizontalAlign: 'left' | 'middle' | 'right', horizontalCalculations: { left: number, right: number, middle: number }): Promise<'left' | 'right' | 'middle'> {
    let overflowCalculations = {
      left: {
        fitInsideScreen: (horizontalCalculations.left + this.expansionProyectedComponent!.offsetWidth) <= window.innerWidth, // Si al realizar el cálculo de horizontalCalculations.left + offsetWidth el resultado es MENOR que window.innerWidth, el expansion-overlay NO se saldrá del viewport actual (tamaño de la pantalla)
        overflow: Math.abs(horizontalCalculations.left + this.expansionProyectedComponent!.offsetWidth - window.innerWidth) // Calcula cuanto se sale el expansion-overlay por la derecha de la pantalla
      },
      right: {
        fitInsideScreen: (window.innerWidth - horizontalCalculations.right - this.expansionProyectedComponent!.offsetWidth) >= 0, // Si al realizar el cálculo de window.innerWidth - horizontalCalculations.right - offsetWidth el resultado es MAYOR que 0, el expansion-overlay NO se saldrá del viewport actual (tamaño de la pantalla)
        overflow: Math.abs(window.innerWidth - horizontalCalculations.right - this.expansionProyectedComponent!.offsetWidth) // Calcula cuanto se sale el expansion-overlay por la izquierda de la pantalla
      },
      middle: {
        fitInsideScreen: this.calculateMiddleOverflow(horizontalCalculations.middle).fitInsideScreen,
        overflow: this.calculateMiddleOverflow(horizontalCalculations.middle).overflow
      }
    };

    // Si el horizontalAlign original cumple la condición de fitInsideScreen (es decir, el expansion-overlay cabe en la pantalla), se devuelve esa posición sin hacer más cálculos.
    if (overflowCalculations[horizontalAlign].fitInsideScreen) {
      return horizontalAlign;
    }

    // Obtener el valor más pequeño de overflow si el expansion-overlay no cabe en la pantalla en la posición de horizontalAlign original
    let minOverflowAlign = horizontalAlign;
    let minOverflow = Infinity;

    // Hace las comprobaciones de overflow para las posiciones 'left' | 'right' | 'middle' en respectivo orden.
    for (const [alignName, alignOverflow] of Object.entries(overflowCalculations)) {
      // Si la posición (alignName) cumple la condición de fitInsideScreen (es decir, el expansion-overlay cabe en la pantalla), se devuelve esa posición sin hacer más cálculos.
      if (alignOverflow.fitInsideScreen) {
        return alignName as 'left' | 'right' | 'middle';
      }

      // Si la posición (alignName) no cumple la condición de fitInsideScreen (es decir, el expansion-overlay NO cabe en la pantalla), se calcula que posición (alignName) tiene menos overflow.
      if (alignOverflow.overflow < minOverflow) {
        minOverflow = alignOverflow.overflow;
        minOverflowAlign = alignName as 'left' | 'right' | 'middle';
      }
    }

    return minOverflowAlign;
  }

  /**
   * Calcula si el expansion-overlay se sale de la pantalla y cuanto se sale el expansion-overlay por la derecha o por la izquierda de la pantalla en la posición 'middle'.
   * @param middleCalculation Cálculo de la posición 'middle' del expansion-overlay.
   * @returns Devuelve si el expansion-overlay cabe en la pantalla en la posición 'middle' y si no cabe, cuanto se sale por el lado que presenta más overflow.
   */
  calculateMiddleOverflow(middleCalculation: number) {
    let leftOverflow = 0;
    let rightOverflow = 0;

    // Calcula cuanto se sale el expansion-overlay por la derecha de la pantalla
    if ((middleCalculation + this.expansionProyectedComponent!.offsetWidth) > window.innerWidth) {
      leftOverflow = Math.abs(middleCalculation + this.expansionProyectedComponent!.offsetWidth - window.innerWidth);
    }

    // Calcula cuanto se sale el expansion-overlay por la izquierda de la pantalla.
    if (middleCalculation < 0) {
      rightOverflow = Math.abs(middleCalculation);
    }

    // Comprueba si el expansion-overlay cabe en la pantalla en la posición 'middle'. Si no cabe devuelve el lado por el que presenta más overflow.
    return { fitInsideScreen: (leftOverflow > 0 || rightOverflow > 0) ? false : true, overflow: Math.max(leftOverflow, rightOverflow) };
  }
  // #endregion

  //#region UPDATE VERTICAL ALIGN
  /**
   * Añade un border-radius al expansion-overlay con los mismos px que tenia el border-radius del componente expandFromItem.
   *
   * Dependiendo del atributo vertical-align el border-radius se pondra la parte de arriba o de abajo del expansion-overlay.
   * @returns {number} Número de px que se tienen que reducir del cálculo de posicionamiento vertical del expansion-overlay para ocultar el border-radius del atributo expand-from-item.
   */
  updateRoundBorder(verticalAlign: string) {
    // No está habilitada la opción para ocultar el borde redondeado del componente expandFromItem.
    if (!this.baseComponentHideRoundBorders) {
      return 0;
    }

    // Se reinician los valores, para que no se queden los valores de la ejecución anterior
    this.expansionComponent!.nativeElement.style.borderTopLeftRadius = 'unset';
    this.expansionComponent!.nativeElement.style.borderTopRightRadius = 'unset';
    this.expansionComponent!.nativeElement.style.borderBottomLeftRadius = 'unset';
    this.expansionComponent!.nativeElement.style.borderBottomRightRadius = 'unset';

    const computedStyles = window.getComputedStyle(this.baseProyectedComponent!); // El componente baseProyectedComponent debe existir aquí obligatoriamente o el código no podría llegar a esta línea

    // Función para convertir porcentaje a píxeles
    const convertPercentageToPixels = (percentage: string, referenceSize: number): number => {
      const value = parseFloat(percentage);
      return (value / 100) * referenceSize;
    };

    // El expansion-overlay sale por encima del componente, la animación de expansión es desde abajo hacia arriba. El border-radius se establece en el top.
    if (verticalAlign == 'top') {
      let borderTopLeftRadius = computedStyles.getPropertyValue('border-top-left-radius');
      let borderTopRightRadius = computedStyles.getPropertyValue('border-top-right-radius');

      // Convertir porcentaje a píxeles si es necesario
      if (borderTopLeftRadius.includes('%')) {
        borderTopLeftRadius = `${convertPercentageToPixels(borderTopLeftRadius, this.baseProyectedComponent!.offsetWidth)}px`;
      }
      if (borderTopRightRadius.includes('%')) {
        borderTopRightRadius = `${convertPercentageToPixels(borderTopRightRadius, this.baseProyectedComponent!.offsetWidth)}px`;
      }

      this.expansionComponent!.nativeElement.style.borderTopLeftRadius = borderTopLeftRadius;
      this.expansionComponent!.nativeElement.style.borderTopRightRadius = borderTopRightRadius;

      // Cantidad de px extra que te vas a mover hacia abajo para evitar que el borde sea visible. Se divide entre 2 porque el border-radius forma una curva, y solo una mitad (que es la mitad horizontal) sería visible.
      return +borderTopLeftRadius.replace('px', '') / 2;
    }

    // El expansion-overlay sale por debajo del componente, la animación de expansión es desde arriba hacia abajo. El border-radius se establece en el bottom.
    if (verticalAlign == 'bottom') {
      let borderBottomLeftRadius = computedStyles.getPropertyValue('border-bottom-left-radius');
      let borderBottomRightRadius = computedStyles.getPropertyValue('border-bottom-right-radius');

      // Convertir porcentaje a píxeles si es necesario
      if (borderBottomLeftRadius.includes('%')) {
        borderBottomLeftRadius = `${convertPercentageToPixels(borderBottomLeftRadius, this.baseProyectedComponent!.offsetWidth)}px`;
      }
      if (borderBottomRightRadius.includes('%')) {
        borderBottomRightRadius = `${convertPercentageToPixels(borderBottomRightRadius, this.baseProyectedComponent!.offsetWidth)}px`;
      }

      this.expansionComponent!.nativeElement.style.borderBottomLeftRadius = borderBottomLeftRadius;
      this.expansionComponent!.nativeElement.style.borderBottomRightRadius = borderBottomRightRadius;

      // Cantidad de px extra que te vas a mover hacia arriba para evitar que el borde sea visible. Se divide entre 2 porque el border-radius forma una curva, y solo una mitad (que es la mitad horizontal) sería visible.
      return +borderBottomLeftRadius.replace('px', '') / 2;
    }

    return 0; // Failsafe return, nunca debería llegar a este return
  }

  /**
   * Actualiza la posición vertical del componente overlayContainer.
   *
   * Cuando se establece la posición del vertical-align se realiza un cálculo para comprobar si el overlayContainer se saldrá de la pantalla por overflow.
   * Si el componente overlayContainer sufre overflow se cambiará el valor de vertical-align por el valor opuesto.
   *
   * @returns {void} El return solo existe para salir del método cuando no se encuentra el componente del atributo expand-from-item en el DOM.
   */
  async updateVerticalAlign() {
    if (!this.isExpanded) { // No se realizan actualizaciones de ubicación al cerrar el overlay
      return;
    }

    // Calculos del expansion-overlay en las diferentes posiciones posibles de verticalAlign
    const verticalCalculations = {
      expandsFromBottomToTop: window.innerHeight - this.baseComponent?.nativeElement.offsetTop, // El expansion-overlay se sitúa por debajo del componente, la animación de expansión es desde arriba hacia abajo.
      expandsFromTopToBottom: this.baseComponent?.nativeElement.offsetTop + this.baseComponent?.nativeElement.offsetHeight // El expansion-overlay se sitúa por encima del componente, la animación de expansión es desde abajo hacia arriba.
    };

    let verticalAlign = this.verticalAlign;
    verticalAlign = await this.checkVerticalAlignAvailability(verticalAlign); // Se realizan los cálculos para ver si el componente overlayContainer se saldrá de la pantalla por overflow
    const borderRadiusValue = this.updateRoundBorder(verticalAlign); // Obtiene los px que se deben eliminar del cálculo de posición vertical para que no aparezca el border-radius del componente expandFromItem

    // El expansion-overlay sale por encima del componente, la animación de expansión es desde abajo hacia arriba.
    if (verticalAlign == 'top') {
      this.expansionComponent!.nativeElement.style.top = 'unset';
      this.expansionComponent!.nativeElement.style.bottom = `${verticalCalculations.expandsFromBottomToTop - borderRadiusValue}px`;
      return;
    }

    // El expansion-overlay sale por debajo del componente, la animación de expansión es desde arriba hacia abajo.
    else if (verticalAlign == 'bottom') {
      this.expansionComponent!.nativeElement.style.top = `${verticalCalculations.expandsFromTopToBottom - borderRadiusValue}px`;
      this.expansionComponent!.nativeElement.style.bottom = 'unset';
      return;
    }
  }

  /**
   * Realiza un cálculo para comprobar si el overlayContainer se saldrá de la pantalla por overflow.
   * Si el componente overlayContainer sufre overflow se cambiará el valor de vertical-align por el valor opuesto.
   * @param {'top' | 'bottom'} verticalAlign Posición original / por defecto del atributo vertical-align.
   * @returns {Promise<'top' | 'bottom'>} Valor definitivo del verticalAlign tras hacer los cálculos.
   */
  async checkVerticalAlignAvailability(verticalAlign: 'top' | 'bottom'): Promise<'top' | 'bottom'> {
    const scrollElement = await this.getScrollElement();

    if (verticalAlign == 'top') {
      // Si al realizar el cálculo de offsetTop - altura expansion-overlay el resultado es MAYOR que scrollY, el expansion-overlay NO se saldrá del viewport actual (tamaño de la pantalla)
      if ((this.baseComponent?.nativeElement.offsetTop - this.expansionProyectedComponent!.offsetHeight) >= (scrollElement?.scrollTop ?? 0)) {
        return verticalAlign;
      }

      return 'bottom';
    }

    else if (verticalAlign == 'bottom') {
      // Si al realizar el cálculo de offsetTop + height + altura expansion-overlay el resultado es MENOR que scrollY + innerHeight, el expansion-overlay NO se saldrá del viewport actual (tamaño de la pantalla)
      if (((scrollElement?.scrollTop ?? 0) + window.innerHeight) >= (this.baseComponent?.nativeElement.offsetTop + this.baseComponent?.nativeElement.offsetHeight + this.expansionProyectedComponent!.offsetHeight)) {
        return verticalAlign;
      }

      return 'top';
    }

    return verticalAlign; // Failsafe return, nunca debería llegar a este return
  }
  //#endregion

  //#region GETTERS
  /**
   * Obtiene el componente baseComponent proyectado.
   * @returns {boolean} Devuelve true si se ha encontrado el componente baseComponent proyectado y false si no se ha encontrado.
   */
  getBaseProyectedComponent(): boolean {
    if (!this.baseComponent || !this.baseComponent.nativeElement || this.baseComponent.nativeElement.children.length === 0) {
      console.error('No se encontró el elemento baseComponent proyectado.');
      return false;
    }

    // El componente ya ha sido inicializado anteriormente
    if (this.baseProyectedComponent) {
      return true;
    }

    const proyectedComponentChild = this.baseComponent.nativeElement.children[0] as HTMLElement;

    // Comprobar si el hijo de baseComponent es el componente proyectado o el div creado por ng-content
    if (proyectedComponentChild.tagName.toLowerCase() === 'div' && (proyectedComponentChild.hasAttribute('baseComponent') || proyectedComponentChild.hasAttribute('baseComponentPushTop')) && proyectedComponentChild.children.length > 0) {
      this.baseProyectedComponent = proyectedComponentChild.children[0] as HTMLElement;
      return true;
    }

    this.baseProyectedComponent = proyectedComponentChild;
    return true;
  }

  /**
   * Obtiene el componente expansionComponent proyectado.
   * @returns {boolean} Devuelve true si se ha encontrado el componente expansionComponent proyectado y false si no se ha encontrado.
   */
  getExpansionProyectedComponent(): boolean {
    if (!this.expansionComponent || !this.expansionComponent.nativeElement || this.expansionComponent.nativeElement.children.length === 0) {
      console.error('No se encontró el elemento expansionComponent proyectado.');
      return false;
    }

    // El componente ya ha sido inicializado anteriormente
    if (this.expansionProyectedComponent) {
      return true;
    }

    const proyectedComponentChild = this.expansionComponent.nativeElement.children[0] as HTMLElement;

    // Comprobar si el hijo de expansionComponent es el componente proyectado o el div creado por ng-content
    if (proyectedComponentChild.tagName.toLowerCase() === 'div' && proyectedComponentChild.hasAttribute('expansionComponent') && proyectedComponentChild.children.length > 0) {
      this.expansionProyectedComponent = proyectedComponentChild.children[0] as HTMLElement;
      return true;
    }

    this.expansionProyectedComponent = proyectedComponentChild;
    return true;
  }

  /**
   * Devuelve el elemento scrollElement de ionContent.getScrollElement()
   * @returns {HTMLElement | undefined} Elemento scrollElement del ionContent
   */
  async getScrollElement() {
    // Acceder al ion-content y obtener el elemento de desplazamiento
    const ionContent = document.querySelector('ion-content');
    const scrollElement = await (ionContent as any)?.getScrollElement();

    // Obtener la posición actual del scroll
    return scrollElement;
  }
  //#endregion
}
