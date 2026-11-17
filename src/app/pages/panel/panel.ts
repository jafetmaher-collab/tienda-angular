
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Productos as ProductoServicio } from '../../services/productos';
import { Producto, ProductInput } from '../../models/producto.models';

@Component({
  selector: 'app-panel',
  imports: [FormsModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel {

  productos = signal<Producto[]>([]);
  categorias = signal<string[]>([]);
  editingId = signal<number | null>(null);

  private servicio = inject(ProductoServicio);

  // Datos del formulario
  form: ProductInput = {
    title: '',
    price: 0,
    description: '',
    category: '',
    image: ''
  };

  ngOnInit(): void {
    this.cargarProductos();

    this.servicio.obtenerCategorias().subscribe({
      next: (data) => {
        this.categorias.set(data);
      },
      error: (error) => {
        console.error('Error al obtener categorías:', error);
      }
    });
  }

  // READ: consultar productos
  cargarProductos(): void {
    this.servicio.obtenerProductos().subscribe({
      next: (datos) => {
        this.productos.set(datos);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
      }
    });
  }

  // Crear o actualizar
  save(): void {

    if (!this.form.title.trim() ||
        !this.form.category ||
        !this.form.image.trim() ||
        this.form.price <= 0) {
      alert('Completa los campos obligatorios');
      return;
    }

    const id = this.editingId();

    if (id === null) {
      this.create();
    } else {
      this.update(id);
    }
  }

  // CREATE: agregar producto
  private create(): void {

    this.servicio.crearProducto(this.form).subscribe({
      next: (producto) => {
        this.productos.update((list) => [
          producto,
          ...list
        ]);

        this.cancel();
        alert('Producto agregado');
      },
      error: (error) => {
        console.error('Error al crear producto:', error);
      }
    });
  }

  // UPDATE: actualizar producto
  private update(id: number): void {

    const datos = { ...this.form };

    this.servicio.actualizarProducto(id, datos).subscribe({
      next: () => {

        this.productos.update((list) =>
          list.map((item) =>
            item.id === id ? { ...item, ...datos } : item
          )
        );

        this.cancel();
        alert('Producto actualizado');
      },
      error: (error) => {
        console.error('Error al actualizar producto:', error);
      }
    });
  }

  // EDIT: llenar formulario
  edit(producto: Producto): void {

    this.editingId.set(producto.id);

    this.form = {
      title: producto.title,
      price: producto.price,
      description: producto.description,
      category: producto.category,
      image: producto.image
    };
  }

  // DELETE: borrar producto
  borrarProducto(id: number): void {

    if (!confirm('¿Deseas borrar este producto?')) {
      return;
    }

    this.servicio.borrarProducto(id).subscribe({
      next: () => {

        this.productos.update((list) =>
          list.filter((producto) => producto.id !== id)
        );

        if (this.editingId() === id) {
          this.cancel();
        }

        alert('Producto eliminado');
      },
      error: (error) => {
        console.error('Error al borrar producto:', error);
      }
    });
  }

  // Limpiar formulario
  cancel(): void {

    this.editingId.set(null);

    this.form = {
      title: '',
      price: 0,
      description: '',
      category: '',
      image: ''
    };
  }
}


