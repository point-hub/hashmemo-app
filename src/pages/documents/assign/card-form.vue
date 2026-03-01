<script setup lang="ts">
import { type IForm } from './form';

const data = defineModel<IForm>('data', {
  default: () => ({
    code: undefined,
    name: undefined,
    composite_unique_1: undefined,
    composite_unique_2: undefined,
    age: undefined,
    gender: undefined,
    optional_unique: undefined,
    notes: undefined,
  }),
});
</script>

<template>
  <base-card title="Choose users who can sign documents">
    <div class="flex flex-col gap-4">
      <base-table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Label</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(i, rowIndex) in 3">
            <td>Nama</td>
            <td>Andi</td>
            <td>In Progress</td>
          </tr>
        </tbody>
      </base-table>
    </div>
  </base-card>
</template>

<style scoped lang="postcss"></style>
